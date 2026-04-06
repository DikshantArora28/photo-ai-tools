"use client";

import { useCallback } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { CleanupCanvas } from "@/components/image-cleanup/CleanupCanvas";
import { CleanupControls } from "@/components/image-cleanup/CleanupControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useToolStore } from "@/store/useToolStore";
import { cleanupImage } from "@/lib/processing/imageCleanup";
import { loadImage, blobToObjectURL, canvasToBlob } from "@/lib/utils/imageConversion";
import { imageToImageData, imageDataToCanvas } from "@/lib/canvas/canvasUtils";

export default function ImageCleanupPage() {
  const original = useImageStore((s) => s.original);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const settings = useToolStore((s) => s.imageCleanup);

  const handleProcess = useCallback(async () => {
    if (!original) return;

    setProcessing(true, "Cleaning up image...");
    setError(null);

    try {
      const img = await loadImage(original.url);
      const imageData = imageToImageData(img);

      const result = cleanupImage(imageData, {
        noiseReduction: settings.noiseReduction,
        sharpness: settings.sharpness,
        scratchRemoval: settings.scratchRemoval,
      });

      const canvas = imageDataToCanvas(result);
      const blob = await canvasToBlob(canvas, "png");
      const url = blobToObjectURL(blob);

      setProcessed({ blob, url, width: canvas.width, height: canvas.height });
      resetApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clean up image");
      resetApp();
    }
  }, [original, settings, setProcessed, setProcessing, setError, resetApp]);

  return (
    <ToolLayout sidebar={<CleanupControls onProcess={handleProcess} />}>
      {original ? <CleanupCanvas /> : <ImageUploader className="h-full" />}
    </ToolLayout>
  );
}
