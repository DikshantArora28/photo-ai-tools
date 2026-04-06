"use client";

import { Eraser, Paintbrush, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Slider } from "@/components/ui/Slider";
import type { BrushMode } from "@/types/image";

interface BrushToolbarProps {
  mode: BrushMode;
  onModeChange: (mode: BrushMode) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function BrushToolbar({
  mode,
  onModeChange,
  brushSize,
  onBrushSizeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: BrushToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-xl bg-white shadow-lg border border-gray-200 px-3 py-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onModeChange("erase")}
          className={cn(
            "p-2 rounded-lg transition-colors",
            mode === "erase"
              ? "bg-violet-100 text-violet-700"
              : "text-gray-500 hover:bg-gray-100"
          )}
          title="Erase (remove foreground)"
        >
          <Eraser className="w-4 h-4" />
        </button>
        <button
          onClick={() => onModeChange("restore")}
          className={cn(
            "p-2 rounded-lg transition-colors",
            mode === "restore"
              ? "bg-violet-100 text-violet-700"
              : "text-gray-500 hover:bg-gray-100"
          )}
          title="Restore (add foreground)"
        >
          <Paintbrush className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <div className="w-32">
        <Slider
          label=""
          value={brushSize}
          min={5}
          max={100}
          onChange={onBrushSizeChange}
        />
      </div>

      <div className="w-px h-6 bg-gray-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
