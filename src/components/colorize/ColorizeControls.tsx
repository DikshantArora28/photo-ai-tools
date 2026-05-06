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
      <div className="space-y-2.5">
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

        <p className="text-[10px] text-amber-600 leading-tight">
          Add color hints by clicking the image for best results.
        </p>

        <Button
          onClick={onProcess}
          disabled={!original || isProcessing}
          className="w-full"
          size="md"
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
