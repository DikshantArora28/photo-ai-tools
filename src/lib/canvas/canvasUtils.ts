export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  return canvas.getContext("2d", { willReadFrequently: true })!;
}

export function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = getContext(canvas);
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = getContext(canvas);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function cloneImageData(data: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
}

export function resizeCanvas(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = getContext(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  return canvas;
}

export function getAlphaChannel(imageData: ImageData): Uint8ClampedArray {
  const alpha = new Uint8ClampedArray(imageData.width * imageData.height);
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = imageData.data[i * 4 + 3];
  }
  return alpha;
}

export function setAlphaChannel(imageData: ImageData, alpha: Uint8ClampedArray): void {
  for (let i = 0; i < alpha.length; i++) {
    imageData.data[i * 4 + 3] = alpha[i];
  }
}
