"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useBrush } from "@/hooks/useBrush";
import { useZoomPan } from "@/hooks/useZoomPan";
import { ZoomPanControls } from "@/components/shared/ZoomPanControls";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import { Undo2, Redo2 } from "lucide-react";
import { Slider } from "@/components/ui/Slider";

interface InpaintCanvasProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

export function InpaintCanvas({ brushSize, onBrushSizeChange }: InpaintCanvasProps) {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const setMask = useImageStore((s) => s.setMask);
  const history = useImageStore((s) => s.history);
  const historyIndex = useImageStore((s) => s.historyIndex);
  const undo = useImageStore((s) => s.undo);
  const redo = useImageStore((s) => s.redo);
  const comparisonMode = useAppStore((s) => s.comparisonMode);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const { transform, zoomIn, zoomOut, resetZoom, onWheel } = useZoomPan();

  const { onMouseDown, onMouseMove, onMouseUp } = useBrush({
    canvasRef,
    maskCanvasRef,
    brushSize,
    brushHardness: 90,
    mode: "restore", // In inpainting, "restore" means "mark for removal"
    onStrokeEnd: (maskData) => setMask(maskData),
  });

  useEffect(() => {
    if (!original || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
      }
    };
    img.src = original.url;
  }, [original]);

  if (!original) return null;

  if (processed && comparisonMode === "slider") {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <ProcessingOverlay />
        <div className="relative max-w-full max-h-full overflow-hidden rounded-xl shadow-lg">
          <BeforeAfterSlider
            beforeSrc={original.url}
            afterSrc={processed.url}
            className="max-h-[calc(100vh-8rem)]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" onWheel={onWheel}>
      <ProcessingOverlay />

      {/* Brush toolbar */}
      {!processed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 rounded-xl bg-white shadow-lg border border-gray-200 px-4 py-2">
          <span className="text-xs font-medium text-gray-600">Paint over objects to remove</span>
          <div className="w-px h-5 bg-gray-200" />
          <div className="w-28">
            <Slider label="" value={brushSize} min={5} max={100} onChange={onBrushSizeChange} />
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div style={{ transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`, transformOrigin: "center" }}>
        <div className="rounded-lg overflow-hidden shadow-lg relative">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
            onMouseDown={processed ? undefined : onMouseDown}
            onMouseMove={processed ? undefined : onMouseMove}
            onMouseUp={processed ? undefined : onMouseUp}
            onMouseLeave={processed ? undefined : onMouseUp}
            style={{ cursor: processed ? "default" : "crosshair" }}
          />
          {!processed && (
            <canvas
              ref={maskCanvasRef}
              className="absolute inset-0 max-w-full max-h-[calc(100vh-10rem)] object-contain pointer-events-none"
              style={{ opacity: 0.4, mixBlendMode: "multiply" }}
            />
          )}
        </div>
      </div>

      <ZoomPanControls scale={transform.scale} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />

      {processed && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-lg bg-white shadow-md border border-gray-200 p-1">
          <button onClick={() => useAppStore.getState().setComparisonMode("slider")} className={`text-xs px-2 py-1 rounded ${comparisonMode === "slider" ? "bg-violet-100 text-violet-700" : "text-gray-500"}`}>Compare</button>
          <button onClick={() => useAppStore.getState().setComparisonMode("toggle")} className={`text-xs px-2 py-1 rounded ${comparisonMode === "toggle" ? "bg-violet-100 text-violet-700" : "text-gray-500"}`}>Result</button>
        </div>
      )}
    </div>
  );
}
