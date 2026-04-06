"use client";

import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { DownloadPanel } from "@/components/shared/DownloadPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { ColorHints } from "./ColorHints";
import { useToolStore } from "@/store/useToolStore";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { Wand2, RotateCcw } from "lucide-react";

interface ColorizeControlsProps {
  onProcess: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorizeControls({ onProcess, selectedColor, onColorChange }: ColorizeControlsProps) {
  const settings = useToolStore((s) => s.colorize);
  const update = useToolStore((s) => s.updateColorize);
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const resetImage = useImageStore((s) => s.reset);

  const removeHint = (id: string) => {
    update({ colorHints: settings.colorHints.filter((h) => h.id !== id) });
  };

  return (
    <Sidebar title="Colorize B&W">
      <div className="space-y-4">
        <Slider
          label="Intensity"
          value={settings.intensity}
          min={0}
          max={100}
          onChange={(v) => update({ intensity: v })}
        />
        <Slider
          label="Saturation"
          value={settings.saturation}
          min={0}
          max={100}
          onChange={(v) => update({ saturation: v })}
        />

        <ColorHints
          hints={settings.colorHints}
          onRemove={removeHint}
          selectedColor={selectedColor}
          onColorChange={onColorChange}
        />

        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            Automatic colorization uses heuristic methods. For best results, add color hints by clicking on the image.
          </p>
        </div>

        <Button
          onClick={onProcess}
          disabled={!original || isProcessing}
          className="w-full"
          size="lg"
        >
          <Wand2 className="w-4 h-4" />
          {isProcessing ? "Processing..." : "Colorize Image"}
        </Button>

        {processed && (
          <>
            <DownloadPanel />
            <Button variant="ghost" size="sm" onClick={resetImage} className="w-full">
              <RotateCcw className="w-3.5 h-3.5" />
              Start over
            </Button>
          </>
        )}
      </div>
    </Sidebar>
  );
}
