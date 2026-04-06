"use client";

import { useCallback, useRef } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { BgRemoverCanvas } from "@/components/bg-remover/BgRemoverCanvas";
import { BgRemoverControls } from "@/components/bg-remover/BgRemoverControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useToolStore } from "@/store/useToolStore";
import { removeImageBackground } from "@/lib/processing/backgroundRemoval";
import { refineEdges } from "@/lib/processing/edgeRefinement";
import { blobToObjectURL } from "@/lib/utils/imageConversion";
import { loadImage } from "@/lib/utils/imageConversion";
import { imageToImageData, imageDataToCanvas } from "@/lib/canvas/canvasUtils";
import { canvasToBlob } from "@/lib/utils/imageConversion";

export default function BackgroundRemoverPage() {
  const original = useImageStore((s) => s.original);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setProgress = useAppStore((s) => s.setProgress);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const settings = useToolStore((s) => s.bgRemover);

  // Store raw result for re-applying refinements
  const rawResultRef = useRef<Blob | null>(null);

  const handleProcess = useCallback(async () => {
    if (!original) return;

    setProcessing(true, "Preparing AI model...");
    setError(null);

    try {
      const result = await removeImageBackground(original.file, (progress) => {
        setProcessing(true, progress.phase);
        setProgress(progress.progress);
      });

      rawResultRef.current = result;

      // Apply initial edge refinement
      const url = blobToObjectURL(result);
      const img = await loadImage(url);
      const imageData = imageToImageData(img);
      URL.revokeObjectURL(url);

      const refined = refineEdges(imageData, {
        feather: settings.feather,
        smooth: settings.smooth,
        threshold: settings.threshold,
      });

      const canvas = imageDataToCanvas(refined);
      const finalBlob = await canvasToBlob(canvas, "png");
      const finalUrl = blobToObjectURL(finalBlob);

      setProcessed({
        blob: finalBlob,
        url: finalUrl,
        width: canvas.width,
        height: canvas.height,
      });

      resetApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove background");
      resetApp();
    }
  }, [original, settings, setProcessed, setProcessing, setProgress, setError, resetApp]);

  const handleApplyRefinement = useCallback(async () => {
    if (!rawResultRef.current) return;

    try {
      const url = blobToObjectURL(rawResultRef.current);
      const img = await loadImage(url);
      const imageData = imageToImageData(img);
      URL.revokeObjectURL(url);

      const refined = refineEdges(imageData, {
        feather: settings.feather,
        smooth: settings.smooth,
        threshold: settings.threshold,
      });

      const canvas = imageDataToCanvas(refined);
      const finalBlob = await canvasToBlob(canvas, "png");
      const finalUrl = blobToObjectURL(finalBlob);

      setProcessed({
        blob: finalBlob,
        url: finalUrl,
        width: canvas.width,
        height: canvas.height,
      });
    } catch {
      // Silently fail on refinement errors
    }
  }, [settings, setProcessed]);

  return (
    <ToolLayout
      sidebar={
        <BgRemoverControls
          onProcess={handleProcess}
          onApplyRefinement={handleApplyRefinement}
        />
      }
    >
      {original ? <BgRemoverCanvas /> : <ImageUploader className="h-full" />}
    </ToolLayout>
  );
}
