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

  // Extract grayscale luminance
  const lum = new Float32Array(width * height);
  for (let i = 0; i < lum.length; i++) {
    const idx = i * 4;
    lum[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  if (options.hints.length > 0) {
    applyColorHints(data, lum, width, height, options.hints, intensity, saturation);
  } else {
    applyAutoColor(data, lum, width, height, intensity, saturation);
  }

  return result;
}

// Convert HSL to RGB (h in 0-360, s and l in 0-1)
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * Auto-colorization: assigns strong visible colors based on luminance and position.
 * Uses HSL with the original luminance as lightness, and assigns hue/saturation.
 */
function applyAutoColor(
  data: Uint8ClampedArray,
  lum: Float32Array,
  width: number,
  height: number,
  intensity: number,
  saturation: number
) {
  // Analyze: is the top bright (likely sky)?
  let topBright = 0, topCount = 0;
  for (let y = 0; y < height * 0.3; y++) {
    for (let x = 0; x < width; x++) {
      topBright += lum[y * width + x];
      topCount++;
    }
  }
  const avgTop = topBright / topCount;
  const hasSky = avgTop > 130;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const L = lum[i];
      const lightness = L / 255; // 0-1

      let hue: number; // 0-360
      let sat: number; // 0-1

      if (hasSky && ny < 0.35 && L > 120) {
        // Sky: vivid blue
        const depth = 1 - ny / 0.35;
        hue = 210 + depth * 10; // 210-220 blue
        sat = 0.5 + depth * 0.3; // strong saturation
      } else if (L > 230) {
        // Very bright highlights: warm cream
        hue = 45;
        sat = 0.15;
      } else if (L < 25) {
        // Deep shadows: dark blue-ish
        hue = 230;
        sat = 0.1;
      } else if (ny > 0.7 && L > 40 && L < 160) {
        // Bottom region: earthy green-brown
        hue = 80 + (L / 160) * 40; // 80-120 (green to yellow-green)
        sat = 0.3;
      } else if (L > 70 && L < 200) {
        // Mid-tones (likely skin, objects): warm skin/sepia tones
        // Vary hue slightly by luminance for natural look
        hue = 20 + (L - 70) * 0.15; // 20-40 (warm orange to peach)
        sat = 0.45 - Math.abs(L - 135) * 0.002; // peak saturation at mid
        sat = Math.max(0.2, sat);
      } else if (L >= 200) {
        // Bright areas: warm yellow
        hue = 40;
        sat = 0.2;
      } else {
        // Dark mid-tones: warm brown
        hue = 25;
        sat = 0.25;
      }

      // Apply user saturation control
      sat *= saturation;

      // Generate the colorized RGB from HSL
      const [cr, cg, cb] = hslToRgb(hue, sat, lightness);

      // Blend between grayscale and colorized based on intensity
      data[idx] = Math.max(0, Math.min(255, Math.round(L * (1 - intensity) + cr * intensity)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(L * (1 - intensity) + cg * intensity)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(L * (1 - intensity) + cb * intensity)));
    }
  }
}

/**
 * Color hints: user-placed color dots. Chrominance is transferred preserving luminance.
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
    const hLum = r * 0.299 + g * 0.587 + b * 0.114;
    return {
      x: Math.round(h.x * width),
      y: Math.round(h.y * height),
      cr: r - hLum,
      cg: g - hLum,
      cb: b - hLum,
      lum: hLum,
    };
  });

  const sigma = Math.sqrt(width * width + height * height) * 0.25;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const L = lum[i];

      let totalW = 0, sumCr = 0, sumCg = 0, sumCb = 0;

      for (const h of parsedHints) {
        const dx = x - h.x;
        const dy = y - h.y;
        const d2 = dx * dx + dy * dy;
        const spatialW = Math.exp(-d2 / (2 * sigma * sigma));
        const lumDiff = L - h.lum;
        const lumW = Math.exp(-(lumDiff * lumDiff) / (2 * 30 * 30));
        const w = spatialW * lumW;

        sumCr += h.cr * w;
        sumCg += h.cg * w;
        sumCb += h.cb * w;
        totalW += w;
      }

      if (totalW > 0) {
        const blend = intensity * saturation;
        data[idx] = Math.max(0, Math.min(255, Math.round(L + (sumCr / totalW) * blend)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(L + (sumCg / totalW) * blend)));
        data[idx + 2] = Math.max(0, Math.min(255, Math.round(L + (sumCb / totalW) * blend)));
      }
    }
  }
}
