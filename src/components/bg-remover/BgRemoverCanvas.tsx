"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useZoomPan } from "@/hooks/useZoomPan";
import { useBrush } from "@/hooks/useBrush";
import { ZoomPanControls } from "@/components/shared/ZoomPanControls";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { BrushToolbar } from "./BrushToolbar";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import type { BrushMode } from "@/types/image";

export function BgRemoverCanvas() {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const setMask = useImageStore((s) => s.setMask);
  const history = useImageStore((s) => s.history);
  const historyIndex = useImageStore((s) => s.historyIndex);
  const undo = useImageStore((s) => s.undo);
  const redo = useImageStore((s) => s.redo);
  const comparisonMode = useAppStore((s) => s.comparisonMode);
  const isProcessing = useAppStore((s) => s.isProcessing);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const [brushMode, setBrushMode] = useState<BrushMode>("erase");
  const [brushSize, setBrushSize] = useState(30);
  const [showBrush, setShowBrush] = useState(false);

  const { transform, zoomIn, zoomOut, resetZoom, onWheel } = useZoomPan();

  const { onMouseDown, onMouseMove, onMouseUp } = useBrush({
    canvasRef,
    maskCanvasRef,
    brushSize,
    brushHardness: 80,
    mode: brushMode,
    onStrokeEnd: (maskData) => setMask(maskData),
  });

  // Draw processed image on canvas
  useEffect(() => {
    if (!processed || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Initialize mask canvas
      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
      }
    };
    img.src = processed.url;
  }, [processed]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (processed) onMouseMove(e);
    },
    [processed, onMouseMove]
  );

  if (!original) return null;

  // Show before/after comparison
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
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onWheel={onWheel}
    >
      <ProcessingOverlay />

      {processed && (
        <BrushToolbar
          mode={brushMode}
          onModeChange={setBrushMode}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={undo}
          onRedo={redo}
        />
      )}

      <div
        className="relative"
        style={{
          transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
          transformOrigin: "center",
        }}
      >
        {/* Checkerboard background for transparency */}
        <div className="checkerboard rounded-lg overflow-hidden shadow-lg">
          {!processed ? (
            <img
              src={original.url}
              alt="Original"
              className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
              draggable={false}
            />
          ) : (
            <div
              className="relative"
              onMouseDown={onMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onMouseEnter={() => setShowBrush(true)}
              style={{ cursor: showBrush ? "crosshair" : "default" }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
              />
              <canvas
                ref={maskCanvasRef}
                className="absolute inset-0 max-w-full max-h-[calc(100vh-10rem)] object-contain pointer-events-none opacity-30"
              />
            </div>
          )}
        </div>
      </div>

      <ZoomPanControls
        scale={transform.scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
      />

      {/* Comparison mode toggle */}
      {processed && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-lg bg-white shadow-md border border-gray-200 p-1">
          <button
            onClick={() => useAppStore.getState().setComparisonMode("slider")}
            className={`text-xs px-2 py-1 rounded ${comparisonMode === "slider" ? "bg-violet-100 text-violet-700" : "text-gray-500"}`}
          >
            Compare
          </button>
          <button
            onClick={() => useAppStore.getState().setComparisonMode("toggle")}
            className={`text-xs px-2 py-1 rounded ${comparisonMode === "toggle" ? "bg-violet-100 text-violet-700" : "text-gray-500"}`}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
