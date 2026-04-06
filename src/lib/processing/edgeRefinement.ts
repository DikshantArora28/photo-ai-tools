import { getAlphaChannel, setAlphaChannel, cloneImageData } from "@/lib/canvas/canvasUtils";
import { applyGaussianBlur } from "@/lib/canvas/filters";
import { morphologicalClose } from "@/lib/canvas/morphology";

export interface EdgeRefinementOptions {
  feather: number;
  smooth: number;
  threshold: number;
}

export function refineEdges(
  imageData: ImageData,
  options: EdgeRefinementOptions
): ImageData {
  const result = cloneImageData(imageData);
  const { width, height } = result;
  let alpha = getAlphaChannel(result);

  // Apply morphological close for smooth edges
  if (options.smooth > 0) {
    alpha = morphologicalClose(alpha, width, height, options.smooth);
  }

  // Apply Gaussian blur for feathering
  if (options.feather > 0) {
    alpha = applyGaussianBlur(alpha, width, height, options.feather);
  }

  // Apply threshold to clean semi-transparent pixels
  if (options.threshold > 0 && options.threshold < 255) {
    for (let i = 0; i < alpha.length; i++) {
      if (alpha[i] < options.threshold * 0.3) {
        alpha[i] = 0;
      } else if (alpha[i] > options.threshold * 0.7 + 76) {
        alpha[i] = 255;
      }
    }
  }

  setAlphaChannel(result, alpha);
  return result;
}
