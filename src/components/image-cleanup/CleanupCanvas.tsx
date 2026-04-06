"use client";

import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { useZoomPan } from "@/hooks/useZoomPan";
import { ZoomPanControls } from "@/components/shared/ZoomPanControls";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";

export function CleanupCanvas() {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const comparisonMode = useAppStore((s) => s.comparisonMode);

  const { transform, zoomIn, zoomOut, resetZoom, onWheel } = useZoomPan();

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

      <div style={{ transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`, transformOrigin: "center" }}>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={displaySrc}
            alt={processed ? "Cleaned up" : "Original"}
            className="max-w-full max-h-[calc(100vh-10rem)] object-contain"
            draggable={false}
          />
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
