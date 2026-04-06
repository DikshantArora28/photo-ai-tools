"use client";

import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { BackgroundReplacer } from "./BackgroundReplacer";
import { DownloadPanel } from "@/components/shared/DownloadPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToolStore } from "@/store/useToolStore";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { Wand2, RotateCcw } from "lucide-react";
import type { BackgroundType } from "@/types/tools";

interface BgRemoverControlsProps {
  onProcess: () => void;
  onApplyRefinement: () => void;
}

export function BgRemoverControls({ onProcess, onApplyRefinement }: BgRemoverControlsProps) {
  const settings = useToolStore((s) => s.bgRemover);
  const update = useToolStore((s) => s.updateBgRemover);
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const resetImage = useImageStore((s) => s.reset);

  return (
    <Sidebar title="Background Remover">
      {!processed ? (
        <div className="space-y-4">
          <Button
            onClick={onProcess}
            disabled={!original || isProcessing}
            className="w-full"
            size="lg"
          >
            <Wand2 className="w-4 h-4" />
            {isProcessing ? "Processing..." : "Remove Background"}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            AI-powered background removal running entirely in your browser
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Edge Refinement</h4>
            <Slider
              label="Feather"
              value={settings.feather}
              min={0}
              max={20}
              onChange={(v) => {
                update({ feather: v });
                onApplyRefinement();
              }}
              unit="px"
            />
            <Slider
              label="Smooth"
              value={settings.smooth}
              min={0}
              max={10}
              onChange={(v) => {
                update({ smooth: v });
                onApplyRefinement();
              }}
              unit="px"
            />
          </div>

          <BackgroundReplacer
            bgType={settings.bgType}
            onBgTypeChange={(t: BackgroundType) => update({ bgType: t })}
            bgColor={settings.bgColor}
            onBgColorChange={(c) => update({ bgColor: c })}
            bgGradient={settings.bgGradient}
            onBgGradientChange={(g) => update({ bgGradient: g })}
            onBgImageUpload={(url) => update({ bgImage: url })}
          />

          <DownloadPanel />

          <Button
            variant="ghost"
            size="sm"
            onClick={resetImage}
            className="w-full"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start over
          </Button>
        </div>
      )}
    </Sidebar>
  );
}
