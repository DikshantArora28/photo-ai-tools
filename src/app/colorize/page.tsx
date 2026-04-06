"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { ColorizeCanvas } from "@/components/colorize/ColorizeCanvas";
import { ColorizeControls } from "@/components/colorize/ColorizeControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useToolStore } from "@/store/useToolStore";
import { colorizeImage } from "@/lib/processing/colorization";
import { loadImage, blobToObjectURL, canvasToBlob } from "@/lib/utils/imageConversion";
import { imageToImageData, imageDataToCanvas } from "@/lib/canvas/canvasUtils";

export default function ColorizePage() {
  const original = useImageStore((s) => s.original);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const settings = useToolStore((s) => s.colorize);
  const [selectedColor, setSelectedColor] = useState("#4a90d9");

  const handleProcess = useCallback(async () => {
    if (!original) return;

    setProcessing(true, "Colorizing image...");
    setError(null);

    try {
      const img = await loadImage(original.url);
      const imageData = imageToImageData(img);

      const result = colorizeImage(imageData, {
        intensity: settings.intensity,
        saturation: settings.saturation,
        hints: settings.colorHints,
      });

      const canvas = imageDataToCanvas(result);
      const blob = await canvasToBlob(canvas, "png");
      const url = blobToObjectURL(blob);

      setProcessed({ blob, url, width: canvas.width, height: canvas.height });
      resetApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to colorize image");
      resetApp();
    }
  }, [original, settings, setProcessed, setProcessing, setError, resetApp]);

  return (
    <ToolLayout
      sidebar={
        <ColorizeControls
          onProcess={handleProcess}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      }
    >
      {original ? (
        <ColorizeCanvas selectedColor={selectedColor} />
      ) : (
        <ImageUploader className="h-full" />
      )}
    </ToolLayout>
  );
}
