"use client";

import { useCallback } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { CleanupCanvas } from "@/components/image-cleanup/CleanupCanvas";
import { CleanupControls } from "@/components/image-cleanup/CleanupControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { blobToObjectURL, loadImage } from "@/lib/utils/imageConversion";

export default function ImageCleanupPage() {
  const original = useImageStore((s) => s.original);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setProgress = useAppStore((s) => s.setProgress);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);

  const handleProcess = useCallback(async () => {
    if (!original) return;

    setProcessing(true, "Enhancing with AI...");
    setProgress(10);
    setError(null);

    try {
      // Call AI enhancement API
      const formData = new FormData();
      formData.append("image", original.file);

      setProgress(30);

      const response = await fetch("/api/enhance", {
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
        return;
      }

      // If API fails, show error
      const errorData = await response.json().catch(() => null);
      setError(errorData?.error || "Enhancement service temporarily unavailable. Please try again.");
      resetApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enhance image");
      resetApp();
    }
  }, [original, setProcessed, setProcessing, setProgress, setError, resetApp]);

  return (
    <ToolLayout sidebar={<CleanupControls onProcess={handleProcess} />}>
      {original ? <CleanupCanvas /> : <ImageUploader className="h-full" />}
    </ToolLayout>
  );
}
