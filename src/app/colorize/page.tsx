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
import { blobToObjectURL, loadImage, canvasToBlob } from "@/lib/utils/imageConversion";
import { imageToImageData, imageDataToCanvas } from "@/lib/canvas/canvasUtils";

export default function ColorizePage() {
  const original = useImageStore((s) => s.original);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setProgress = useAppStore((s) => s.setProgress);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const settings = useToolStore((s) => s.colorize);
  const [selectedColor, setSelectedColor] = useState("#4a90d9");

  const handleProcess = useCallback(async () => {
    if (!original) return;

    setProcessing(true, "Colorizing with AI...");
    setProgress(10);
    setError(null);

    try {
      // Try AI colorization via API first
      const formData = new FormData();
      formData.append("image", original.file);

      setProgress(30);

      const response = await fetch("/api/colorize", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setProgress(80);
        const blob = await response.blob();
        const url = blobToObjectURL(blob);

        // Get dimensions
        const img = await loadImage(url);
        setProcessed({
          blob,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        resetApp();
        return;
      }

      // If API fails, fall back to client-side heuristic
      console.log("AI API unavailable, using local fallback");
      setProcessing(true, "Using local colorization...");
      setProgress(50);

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
      // Last resort: try local fallback
      try {
        setProcessing(true, "Using local colorization...");
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
      } catch (fallbackErr) {
        setError(fallbackErr instanceof Error ? fallbackErr.message : "Failed to colorize image");
        resetApp();
      }
    }
  }, [original, settings, setProcessed, setProcessing, setProgress, setError, resetApp]);

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
