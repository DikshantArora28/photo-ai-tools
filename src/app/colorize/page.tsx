"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { ColorizeCanvas } from "@/components/colorize/ColorizeCanvas";
import { ColorizeControls } from "@/components/colorize/ColorizeControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { colorizeImage } from "@/lib/processing/colorization";
import { blobToObjectURL, loadImage } from "@/lib/utils/imageConversion";

export default function ColorizePage() {
  const original = useImageStore((s) => s.original);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setProgress = useAppStore((s) => s.setProgress);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const [selectedColor, setSelectedColor] = useState("#4a90d9");

  const handleProcess = useCallback(async () => {
    if (!original) return;

    setProcessing(true, "Loading AI model...");
    setProgress(5);
    setError(null);

    try {
      // Run DeOldify ONNX model directly in the browser
      const blob = await colorizeImage(original.file, {
        onProgress: (message, percent) => {
          setProcessing(true, message);
          setProgress(percent);
        },
      });

      const url = blobToObjectURL(blob);
      const img = await loadImage(url);

      setProcessed({
        blob,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      resetApp();
    } catch (err) {
      console.error("Colorization error:", err);
      setError(err instanceof Error ? err.message : "Failed to colorize image. Please try again.");
      resetApp();
    }
  }, [original, setProcessed, setProcessing, setProgress, setError, resetApp]);

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
