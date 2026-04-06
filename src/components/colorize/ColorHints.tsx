"use client";

import { X } from "lucide-react";
import type { ColorHint } from "@/types/tools";

interface ColorHintsProps {
  hints: ColorHint[];
  onRemove: (id: string) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorHints({ hints, onRemove, selectedColor, onColorChange }: ColorHintsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Color Hints</span>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
        />
      </div>
      <p className="text-xs text-gray-500">
        Click on the image to place color hints for better results
      </p>
      {hints.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hints.map((hint) => (
            <div
              key={hint.id}
              className="flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5"
            >
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: hint.color }}
              />
              <button
                onClick={() => onRemove(hint.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
