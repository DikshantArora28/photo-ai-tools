"use client";

import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ZoomPanControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomPanControls({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomPanControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 rounded-lg bg-white shadow-md border border-gray-200 p-1">
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="text-xs text-gray-500 w-12 text-center tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-gray-200" />
      <button
        onClick={onReset}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
        title="Reset zoom"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
