import { cloneImageData } from "@/lib/canvas/canvasUtils";
import type { ColorHint } from "@/types/tools";

export interface ColorizeOptions {
  intensity: number; // 0-100
  saturation: number; // 0-100
  hints: ColorHint[];
}

export function colorizeImage(
  imageData: ImageData,
  options: ColorizeOptions
): ImageData {
  const result = cloneImageData(imageData);
  const { width, height, data } = result;
  const intensity = options.intensity / 100;
  const saturation = options.saturation / 100;

  // First convert to grayscale luminance (in case image has slight color cast)
  const lum = new Float32Array(width * height);
  for (let i = 0; i < lum.length; i++) {
    const idx = i * 4;
    lum[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  if (options.hints.length > 0) {
    applyColorHints(data, lum, width, height, options.hints, intensity, saturation);
  } else {
    applySmartColor(data, lum, width, height, intensity, saturation);
  }

  return result;
}

/**
 * Smart auto-colorization using luminance-based region analysis.
 * Uses LAB-like approach: keeps original luminance, adds chrominance.
 */
function applySmartColor(
  data: Uint8ClampedArray,
  lum: Float32Array,
  width: number,
  height: number,
  intensity: number,
  saturation: number
) {
  // Analyze image to detect regions
  // Compute average luminance for top/middle/bottom thirds
  const thirds = [0, 0, 0];
  const thirdCounts = [0, 0, 0];
  for (let y = 0; y < height; y++) {
    const third = y < height / 3 ? 0 : y < (2 * height) / 3 ? 1 : 2;
    for (let x = 0; x < width; x++) {
      thirds[third] += lum[y * width + x];
      thirdCounts[third]++;
    }
  }
  const avgLum = thirds.map((s, i) => s / thirdCounts[i]);

  // Detect if top is likely sky (bright top, darker middle)
  const hasSky = avgLum[0] > 140 && avgLum[0] > avgLum[1] * 1.1;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const L = lum[i];
      const nL = L / 255; // normalized 0-1

      // Determine color based on luminance + position
      let r: number, g: number, b: number;

      if (hasSky && ny < 0.4 && L > 120) {
        // Sky: blue gradient, lighter near horizon
        const skyDepth = 1 - ny / 0.4; // 1 at top, 0 at horizon
        const blueness = 0.3 + skyDepth * 0.3;
        r = L * (1 - blueness * 0.5);
        g = L * (1 - blueness * 0.2);
        b = L * (1 + blueness * 0.3);
      } else if (L > 220) {
        // Very bright: warm white (slight yellow)
        r = L;
        g = L * 0.98;
        b = L * 0.92;
      } else if (L < 30) {
        // Very dark: cool shadow
        r = L * 0.95;
        g = L * 0.95;
        b = L * 1.05;
      } else if (ny > 0.65 && L < 150) {
        // Lower region, medium dark: earthy/green ground
        const earthiness = (ny - 0.65) / 0.35;
        r = L * (0.95 + earthiness * 0.1);
        g = L * (1.0 + earthiness * 0.05);
        b = L * (0.85 - earthiness * 0.05);
      } else {
        // Skin-tone friendly: warm palette for people/objects
        // Use luminance to guide: mid-tones get warm, dark get neutral
        const warmth = Math.max(0, Math.min(1, (L - 60) / 140)); // peaks at mid-tones
        r = L * (1 + warmth * 0.12);
        g = L * (1 + warmth * 0.04);
        b = L * (1 - warmth * 0.1);
      }

      // Apply intensity and saturation
      const sat = saturation;
      const finalR = L + (r - L) * sat * intensity;
      const finalG = L + (g - L) * sat * intensity;
      const finalB = L + (b - L) * sat * intensity;

      data[idx] = Math.max(0, Math.min(255, Math.round(finalR)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(finalG)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(finalB)));
    }
  }
}

/**
 * Color hints: user-placed color dots propagated across the image.
 * Uses luminance-aware distance weighting for natural blending.
 */
function applyColorHints(
  data: Uint8ClampedArray,
  lum: Float32Array,
  width: number,
  height: number,
  hints: ColorHint[],
  intensity: number,
  saturation: number
) {
  const parsedHints = hints.map((h) => {
    const r = parseInt(h.color.slice(1, 3), 16);
    const g = parseInt(h.color.slice(3, 5), 16);
    const b = parseInt(h.color.slice(5, 7), 16);
    const hintLum = r * 0.299 + g * 0.587 + b * 0.114;
    return {
      x: Math.round(h.x * width),
      y: Math.round(h.y * height),
      // Store chrominance (color minus luminance)
      cr: r - hintLum,
      cg: g - hintLum,
      cb: b - hintLum,
      lum: hintLum,
    };
  });

  // Influence radius relative to image size
  const radius = Math.sqrt(width * width + height * height) * 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const L = lum[i];

      let totalWeight = 0;
      let sumCr = 0, sumCg = 0, sumCb = 0;

      for (const hint of parsedHints) {
        const dx = x - hint.x;
        const dy = y - hint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Spatial weight: Gaussian falloff
        const spatialW = Math.exp(-(dist * dist) / (2 * radius * radius / 4));

        // Luminance similarity weight
        const lumDiff = Math.abs(L - hint.lum);
        const lumW = Math.exp(-(lumDiff * lumDiff) / (2 * 40 * 40));

        const weight = spatialW * lumW;

        // Transfer chrominance (not raw color)
        sumCr += hint.cr * weight;
        sumCg += hint.cg * weight;
        sumCb += hint.cb * weight;
        totalWeight += weight;
      }

      if (totalWeight > 0) {
        const cr = sumCr / totalWeight;
        const cg = sumCg / totalWeight;
        const cb = sumCb / totalWeight;

        // Add chrominance to luminance — preserves brightness
        const blend = intensity * saturation;
        data[idx] = Math.max(0, Math.min(255, Math.round(L + cr * blend)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(L + cg * blend)));
        data[idx + 2] = Math.max(0, Math.min(255, Math.round(L + cb * blend)));
      }
    }
  }
}
