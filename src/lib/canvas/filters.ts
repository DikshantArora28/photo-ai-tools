export function gaussianKernel(radius: number): number[] {
  const size = radius * 2 + 1;
  const kernel = new Array(size * size);
  const sigma = radius / 3;
  let sum = 0;

  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      kernel[(y + radius) * size + (x + radius)] = value;
      sum += value;
    }
  }

  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

export function applyGaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  if (radius <= 0) return new Uint8ClampedArray(data);

  const kernel = gaussianKernel(radius);
  const size = radius * 2 + 1;
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const sx = Math.max(0, Math.min(width - 1, x + kx));
          const sy = Math.max(0, Math.min(height - 1, y + ky));
          const weight = kernel[(ky + radius) * size + (kx + radius)];
          sum += data[sy * width + sx] * weight;
        }
      }
      result[y * width + x] = Math.round(sum);
    }
  }

  return result;
}

export function medianFilter(
  imageData: ImageData,
  radius: number
): ImageData {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        const values: number[] = [];
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const sx = Math.max(0, Math.min(width - 1, x + kx));
            const sy = Math.max(0, Math.min(height - 1, y + ky));
            values.push(data[(sy * width + sx) * 4 + c]);
          }
        }
        values.sort((a, b) => a - b);
        result[(y * width + x) * 4 + c] = values[Math.floor(values.length / 2)];
      }
      result[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
    }
  }

  return new ImageData(result, width, height);
}

export function bilateralFilter(
  imageData: ImageData,
  radius: number,
  sigmaSpace: number,
  sigmaColor: number
): ImageData {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let weightSum = 0;
        let valueSum = 0;
        const centerVal = data[idx + c];

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const sx = Math.max(0, Math.min(width - 1, x + kx));
            const sy = Math.max(0, Math.min(height - 1, y + ky));
            const sidx = (sy * width + sx) * 4;
            const val = data[sidx + c];

            const spatialDist = kx * kx + ky * ky;
            const colorDist = (centerVal - val) * (centerVal - val);

            const weight =
              Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace)) *
              Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));

            weightSum += weight;
            valueSum += val * weight;
          }
        }
        result[idx + c] = Math.round(valueSum / weightSum);
      }
      result[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(result, width, height);
}

export function unsharpMask(
  imageData: ImageData,
  amount: number,
  radius: number,
  threshold: number
): ImageData {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data.length);

  // Create grayscale for blur
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    gray[i] = Math.round(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
  }

  const blurred = applyGaussianBlur(gray, width, height, radius);

  for (let i = 0; i < gray.length; i++) {
    const idx = i * 4;
    const diff = gray[i] - blurred[i];

    if (Math.abs(diff) > threshold) {
      for (let c = 0; c < 3; c++) {
        result[idx + c] = Math.max(0, Math.min(255, data[idx + c] + diff * (amount / 100)));
      }
    } else {
      result[idx] = data[idx];
      result[idx + 1] = data[idx + 1];
      result[idx + 2] = data[idx + 2];
    }
    result[idx + 3] = data[idx + 3];
  }

  return new ImageData(result, width, height);
}
