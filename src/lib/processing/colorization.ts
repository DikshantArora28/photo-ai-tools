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

  if (options.hints.length > 0) {
    applyColorHints(data, width, height, options.hints, intensity, saturation);
  } else {
    applyHeuristicColor(data, width, height, intensity, saturation);
  }

  return result;
}

function applyHeuristicColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  saturation: number
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const L = data[idx]; // Grayscale luminance

      // Normalized position
      const ny = y / height;

      // Heuristic: sky (top, bright) -> blue; ground (bottom) -> brown/green
      let hue: number;
      let sat: number;

      if (ny < 0.35 && L > 150) {
        // Sky region: blue
        hue = 210;
        sat = 0.4 * saturation;
      } else if (ny < 0.35 && L > 100) {
        // Sky region: lighter blue
        hue = 200;
        sat = 0.3 * saturation;
      } else if (L > 200) {
        // Very bright: warm white
        hue = 40;
        sat = 0.1 * saturation;
      } else if (L < 50) {
        // Very dark: slight warm
        hue = 30;
        sat = 0.15 * saturation;
      } else if (ny > 0.7) {
        // Ground: earthy brown/green
        hue = 35;
        sat = 0.25 * saturation;
      } else {
        // Mid: warm sepia
        hue = 30;
        sat = 0.2 * saturation;
      }

      const rgb = hslToRgb(hue / 360, sat, L / 255);
      data[idx] = Math.round(L * (1 - intensity) + rgb[0] * intensity);
      data[idx + 1] = Math.round(L * (1 - intensity) + rgb[1] * intensity);
      data[idx + 2] = Math.round(L * (1 - intensity) + rgb[2] * intensity);
    }
  }
}

function applyColorHints(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  hints: ColorHint[],
  intensity: number,
  saturation: number
) {
  const parsedHints = hints.map((h) => ({
    x: Math.round(h.x * width),
    y: Math.round(h.y * height),
    r: parseInt(h.color.slice(1, 3), 16),
    g: parseInt(h.color.slice(3, 5), 16),
    b: parseInt(h.color.slice(5, 7), 16),
  }));

  const maxDist = Math.sqrt(width * width + height * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const L = data[idx];

      let totalWeight = 0;
      let sumR = 0, sumG = 0, sumB = 0;

      for (const hint of parsedHints) {
        const dx = x - hint.x;
        const dy = y - hint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Weight by distance and luminance similarity
        const lumDiff = Math.abs(L - (hint.r * 0.299 + hint.g * 0.587 + hint.b * 0.114));
        const distWeight = 1 / (1 + (dist / maxDist) * 10);
        const lumWeight = 1 / (1 + lumDiff / 50);
        const weight = distWeight * lumWeight;

        sumR += hint.r * weight;
        sumG += hint.g * weight;
        sumB += hint.b * weight;
        totalWeight += weight;
      }

      if (totalWeight > 0) {
        const cr = sumR / totalWeight;
        const cg = sumG / totalWeight;
        const cb = sumB / totalWeight;

        // Blend: preserve luminance, add color
        const colorIntensity = intensity * saturation;
        data[idx] = Math.max(0, Math.min(255,
          L * (1 - colorIntensity) + cr * colorIntensity
        ));
        data[idx + 1] = Math.max(0, Math.min(255,
          L * (1 - colorIntensity) + cg * colorIntensity
        ));
        data[idx + 2] = Math.max(0, Math.min(255,
          L * (1 - colorIntensity) + cb * colorIntensity
        ));
      }
    }
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];

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
