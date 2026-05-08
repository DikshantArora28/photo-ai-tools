/**
 * DeOldify colorization running entirely in-browser via ONNX Runtime.
 * Model: quantized DeOldify (~30MB, cached after first download).
 * No external API needed.
 */

const MODEL_URL = "https://cdn.glitch.me/2046b88b-673a-457f-b1b8-7169ce9bf13a/deoldify-quant.onnx";
const MODEL_SIZE = 256; // Model processes at 256x256

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSession: any = null;

export interface ColorizeOptions {
  onProgress?: (message: string, percent: number) => void;
}

export async function colorizeImage(
  imageFile: File | Blob,
  options?: ColorizeOptions
): Promise<Blob> {
  // Dynamic import for browser-only module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ort = await import("onnxruntime-web") as any;

  ort.env.wasm.numThreads = 1;

  const progress = options?.onProgress || (() => {});

  // Step 1: Load model (cached after first load)
  progress("Loading AI model...", 10);
  if (!cachedSession) {
    progress("Downloading AI model (first time only)...", 15);
    cachedSession = await ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
    });
  }
  const session = cachedSession;

  // Step 2: Load and prepare input image
  progress("Preparing image...", 40);
  const imgBitmap = await createImageBitmap(imageFile);
  const origW = imgBitmap.width;
  const origH = imgBitmap.height;

  // Draw to 256x256 canvas for model input
  const inputCanvas = document.createElement("canvas");
  inputCanvas.width = MODEL_SIZE;
  inputCanvas.height = MODEL_SIZE;
  const inputCtx = inputCanvas.getContext("2d")!;
  inputCtx.drawImage(imgBitmap, 0, 0, MODEL_SIZE, MODEL_SIZE);
  const inputImageData = inputCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE);

  // Preprocess: RGBA -> CHW float32 tensor [1, 3, 256, 256]
  const floatData = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
  const pixels = inputImageData.data;
  const pixelCount = MODEL_SIZE * MODEL_SIZE;

  for (let i = 0; i < pixelCount; i++) {
    floatData[i] = pixels[i * 4];                      // R channel
    floatData[pixelCount + i] = pixels[i * 4 + 1];     // G channel
    floatData[2 * pixelCount + i] = pixels[i * 4 + 2]; // B channel
  }

  const inputTensor = new ort.Tensor("float32", floatData, [1, 3, MODEL_SIZE, MODEL_SIZE]);

  // Step 3: Run inference
  progress("AI colorizing...", 60);
  const results = await session.run({ input: inputTensor });
  const output = results["out"];

  // Step 4: Postprocess: CHW tensor -> RGBA ImageData
  progress("Generating output...", 85);
  const outputData = new Float32Array(output.cpuData || output.data);
  const outH = output.dims[2];
  const outW = output.dims[3];
  const channels = output.dims[1];

  const resultImageData = new ImageData(outW, outH);
  const resultPixels = resultImageData.data;

  for (let h = 0; h < outH; h++) {
    for (let w = 0; w < outW; w++) {
      const pixelIdx = (h * outW + w) * 4;
      for (let c = 0; c < channels; c++) {
        const tensorIdx = (c * outH + h) * outW + w;
        resultPixels[pixelIdx + c] = Math.max(0, Math.min(255, Math.round(outputData[tensorIdx])));
      }
      resultPixels[pixelIdx + 3] = 255;
    }
  }

  // Step 5: Scale result back to original dimensions
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = outW;
  smallCanvas.height = outH;
  smallCanvas.getContext("2d")!.putImageData(resultImageData, 0, 0);

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = origW;
  finalCanvas.height = origH;
  const finalCtx = finalCanvas.getContext("2d")!;
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";
  finalCtx.drawImage(smallCanvas, 0, 0, origW, origH);

  progress("Done!", 100);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      "image/png",
      1
    );
  });
}
