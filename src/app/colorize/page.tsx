"use client";

import { useCallback, useState } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { ColorizeCanvas } from "@/components/colorize/ColorizeCanvas";
import { ColorizeControls } from "@/components/colorize/ColorizeControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
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

    setProcessing(true, "Colorizing with AI (DeOldify)...");
    setProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", original.file);

      setProgress(20);

      const response = await fetch("/api/colorize", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (response.ok) {
        const blob = await response.blob();
        const url = blobToObjectURL(blob);
        const img = await loadImage(url);

        setProcessed({
          blob,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        resetApp();
      } else {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        setError(err.error || "Colorization failed. Please try again.");
        resetApp();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
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
