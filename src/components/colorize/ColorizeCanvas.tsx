"use client";

import { useRef, useCallback } from "react";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useToolStore } from "@/store/useToolStore";
import { useZoomPan } from "@/hooks/useZoomPan";
import { ZoomPanControls } from "@/components/shared/ZoomPanControls";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import type { ColorHint } from "@/types/tools";

interface ColorizeCanvasProps {
  selectedColor: string;
}

export function ColorizeCanvas({ selectedColor }: ColorizeCanvasProps) {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const comparisonMode = useAppStore((s) => s.comparisonMode);
  const hints = useToolStore((s) => s.colorize.colorHints);
  const updateColorize = useToolStore((s) => s.updateColorize);

  const imgRef = useRef<HTMLImageElement>(null);
  const { transform, zoomIn, zoomOut, resetZoom, onWheel } = useZoomPan();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (processed) return;
      const img = imgRef.current;
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const newHint: ColorHint = {
        x,
        y,
        color: selectedColor,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      updateColorize({ colorHints: [...hints, newHint] });
    },
    [processed, selectedColor, hints, updateColorize]
  );

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

  const displaySrc = processed ? processed.url : original.url;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" onWheel={onWheel}>
      <ProcessingOverlay />

      {!processed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-white shadow-md border border-gray-200 px-3 py-1.5">
          <span className="text-xs text-gray-600">Click to add color hints</span>
        </div>
      )}

      <div style={{ transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`, transformOrigin: "center" }}>
        <div className="relative rounded-lg overflow-hidden shadow-lg" onClick={handleClick} style={{ cursor: processed ? "default" : "crosshair" }}>
          <img
            ref={imgRef}
            src={displaySrc}
            alt={processed ? "Colorized" : "Original"}
            className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
            draggable={false}
          />
          {/* Render color hint dots */}
          {!processed && hints.map((hint) => (
            <div
              key={hint.id}
              className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
              style={{
                left: `${hint.x * 100}%`,
                top: `${hint.y * 100}%`,
                backgroundColor: hint.color,
              }}
            />
          ))}
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
