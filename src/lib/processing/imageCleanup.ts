import { cloneImageData } from "@/lib/canvas/canvasUtils";
import { medianFilter, bilateralFilter, unsharpMask } from "@/lib/canvas/filters";

export interface CleanupOptions {
  noiseReduction: number; // 0-100
  sharpness: number; // 0-100
  scratchRemoval: boolean;
}

export function cleanupImage(
  imageData: ImageData,
  options: CleanupOptions
): ImageData {
  let result = cloneImageData(imageData);

  // Step 1: Noise reduction
  if (options.noiseReduction > 0) {
    const strength = options.noiseReduction / 100;

    if (strength < 0.3) {
      // Light: median filter radius 1
      result = medianFilter(result, 1);
    } else if (strength < 0.6) {
      // Medium: bilateral filter
      result = bilateralFilter(result, 2, 10, 30 * strength);
    } else {
      // Heavy: median + bilateral
      result = medianFilter(result, 1);
      result = bilateralFilter(result, 3, 15, 50 * strength);
    }
  }

  // Step 2: Scratch removal via median on detected scratches
  if (options.scratchRemoval) {
    result = removeScratchesSimple(result);
  }

  // Step 3: Sharpening
  if (options.sharpness > 0) {
    const amount = options.sharpness * 1.5;
    const radius = options.sharpness < 50 ? 1 : 2;
    result = unsharpMask(result, amount, radius, 5);
  }

  return result;
}

function removeScratchesSimple(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data);

  // Simple scratch detection: look for thin bright/dark lines
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const center = data[idx + c];
        const left = data[(y * width + x - 1) * 4 + c];
        const right = data[(y * width + x + 1) * 4 + c];
        const top = data[((y - 1) * width + x) * 4 + c];
        const bottom = data[((y + 1) * width + x) * 4 + c];

        const avgH = (left + right) / 2;
        const avgV = (top + bottom) / 2;

        // Horizontal scratch: big vertical difference
        const diffH = Math.abs(center - avgH);
        const diffV = Math.abs(center - avgV);

        if (diffH > 40 && diffV < 15) {
          result[idx + c] = Math.round(avgH);
        } else if (diffV > 40 && diffH < 15) {
          result[idx + c] = Math.round(avgV);
        }
      }
    }
  }

  return new ImageData(result, width, height);
}
