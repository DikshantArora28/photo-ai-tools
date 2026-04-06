"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { InpaintCanvas } from "@/components/object-remover/InpaintCanvas";
import { InpaintControls } from "@/components/object-remover/InpaintControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { inpaint } from "@/lib/processing/inpainting";
import { loadImage, blobToObjectURL, canvasToBlob } from "@/lib/utils/imageConversion";
import { imageToImageData, imageDataToCanvas } from "@/lib/canvas/canvasUtils";

export default function ObjectRemoverPage() {
  const original = useImageStore((s) => s.original);
  const mask = useImageStore((s) => s.mask);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const [brushSize, setBrushSize] = useState(30);

  const handleProcess = useCallback(async () => {
    if (!original || !mask) return;

    setProcessing(true, "Removing objects...");
    setError(null);

    try {
      const img = await loadImage(original.url);
      const imageData = imageToImageData(img);
      const result = inpaint(imageData, mask, 8);
      const canvas = imageDataToCanvas(result);
      const blob = await canvasToBlob(canvas, "png");
      const url = blobToObjectURL(blob);

      setProcessed({
        blob,
        url,
        width: canvas.width,
        height: canvas.height,
      });

      resetApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove objects");
      resetApp();
    }
  }, [original, mask, setProcessed, setProcessing, setError, resetApp]);

  return (
    <ToolLayout sidebar={<InpaintControls onProcess={handleProcess} />}>
      {original ? (
        <InpaintCanvas brushSize={brushSize} onBrushSizeChange={setBrushSize} />
      ) : (
        <ImageUploader className="h-full" />
      )}
    </ToolLayout>
  );
}
