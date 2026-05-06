"use client";

import { useCallback, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { BgRemoverCanvas } from "@/components/bg-remover/BgRemoverCanvas";
import { BgRemoverControls } from "@/components/bg-remover/BgRemoverControls";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useToolStore } from "@/store/useToolStore";
import { removeImageBackground } from "@/lib/processing/backgroundRemoval";
import { refineEdges } from "@/lib/processing/edgeRefinement";
import { replaceBackground } from "@/lib/processing/backgroundReplace";
import { blobToObjectURL, loadImage, canvasToBlob } from "@/lib/utils/imageConversion";
import { imageToImageData, imageDataToCanvas } from "@/lib/canvas/canvasUtils";

export default function BackgroundRemoverPage() {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const setProcessed = useImageStore((s) => s.setProcessed);
  const setProcessing = useAppStore((s) => s.setProcessing);
  const setProgress = useAppStore((s) => s.setProgress);
  const setError = useAppStore((s) => s.setError);
  const resetApp = useAppStore((s) => s.reset);
  const settings = useToolStore((s) => s.bgRemover);

  // Store the transparent foreground (after edge refinement, before bg replace)
  const foregroundBlobRef = useRef<Blob | null>(null);
  // Store raw AI result for re-applying refinements
  const rawResultRef = useRef<Blob | null>(null);

  // Helper: apply edge refinement + background replacement, then update processed
  const applyForegroundWithBg = useCallback(
    async (fgBlob: Blob) => {
      try {
        const fgUrl = blobToObjectURL(fgBlob);
        const fgImg = await loadImage(fgUrl);
        const fgCanvas = document.createElement("canvas");
        fgCanvas.width = fgImg.naturalWidth;
        fgCanvas.height = fgImg.naturalHeight;
        fgCanvas.getContext("2d")!.drawImage(fgImg, 0, 0);
        URL.revokeObjectURL(fgUrl);

        let finalCanvas: HTMLCanvasElement;

        if (settings.bgType === "transparent") {
          finalCanvas = fgCanvas;
        } else {
          finalCanvas = await replaceBackground(fgCanvas, {
            type: settings.bgType,
            color: settings.bgColor,
            gradient: settings.bgGradient,
            imageSrc: settings.bgImage || undefined,
          });
        }

        const finalBlob = await canvasToBlob(finalCanvas, "png");
        const finalUrl = blobToObjectURL(finalBlob);

        setProcessed({
          blob: finalBlob,
          url: finalUrl,
          width: finalCanvas.width,
          height: finalCanvas.height,
        });
      } catch {
        // Silently fail
      }
    },
    [settings.bgType, settings.bgColor, settings.bgGradient, settings.bgImage, setProcessed]
  );

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

      // Apply edge refinement
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
      const fgBlob = await canvasToBlob(canvas, "png");
      foregroundBlobRef.current = fgBlob;

      // Apply background replacement
      await applyForegroundWithBg(fgBlob);

      resetApp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove background");
      resetApp();
    }
  }, [original, settings.feather, settings.smooth, settings.threshold, setProcessed, setProcessing, setProgress, setError, resetApp, applyForegroundWithBg]);

  // Re-apply edge refinement when feather/smooth changes
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
      const fgBlob = await canvasToBlob(canvas, "png");
      foregroundBlobRef.current = fgBlob;

      await applyForegroundWithBg(fgBlob);
    } catch {
      // Silently fail
    }
  }, [settings.feather, settings.smooth, settings.threshold, applyForegroundWithBg]);

  // Auto-apply background when bgType, bgColor, bgGradient, or bgImage changes
  useEffect(() => {
    if (!foregroundBlobRef.current || !processed) return;
    applyForegroundWithBg(foregroundBlobRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.bgType, settings.bgColor, settings.bgGradient, settings.bgImage]);

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
