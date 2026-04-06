"use client";

import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { DownloadPanel } from "@/components/shared/DownloadPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToolStore } from "@/store/useToolStore";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { Wand2, RotateCcw } from "lucide-react";

interface CleanupControlsProps {
  onProcess: () => void;
}

export function CleanupControls({ onProcess }: CleanupControlsProps) {
  const settings = useToolStore((s) => s.imageCleanup);
  const update = useToolStore((s) => s.updateImageCleanup);
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const resetImage = useImageStore((s) => s.reset);

  return (
    <Sidebar title="Image Cleanup">
      <div className="space-y-4">
        <Slider
          label="Noise Reduction"
          value={settings.noiseReduction}
          min={0}
          max={100}
          onChange={(v) => update({ noiseReduction: v })}
        />
        <Slider
          label="Sharpness"
          value={settings.sharpness}
          min={0}
          max={100}
          onChange={(v) => update({ sharpness: v })}
        />
        <Toggle
          label="Scratch Removal"
          checked={settings.scratchRemoval}
          onChange={(v) => update({ scratchRemoval: v })}
        />

        <Button
          onClick={onProcess}
          disabled={!original || isProcessing}
          className="w-full"
          size="lg"
        >
          <Wand2 className="w-4 h-4" />
          {isProcessing ? "Processing..." : "Clean Up Image"}
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
