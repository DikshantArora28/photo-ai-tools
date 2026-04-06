"use client";

import { Button } from "@/components/ui/Button";
import { DownloadPanel } from "@/components/shared/DownloadPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { Wand2, RotateCcw } from "lucide-react";

interface InpaintControlsProps {
  onProcess: () => void;
}

export function InpaintControls({ onProcess }: InpaintControlsProps) {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const mask = useImageStore((s) => s.mask);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const resetImage = useImageStore((s) => s.reset);

  return (
    <Sidebar title="Object Remover">
      {!processed ? (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Paint over the objects or people you want to remove, then click process.
          </p>
          <Button
            onClick={onProcess}
            disabled={!original || !mask || isProcessing}
            className="w-full"
            size="lg"
          >
            <Wand2 className="w-4 h-4" />
            {isProcessing ? "Processing..." : "Remove Objects"}
          </Button>
          {!mask && original && (
            <p className="text-xs text-amber-600 text-center">
              Paint over the area you want to remove first
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <DownloadPanel />
          <Button variant="ghost" size="sm" onClick={resetImage} className="w-full">
            <RotateCcw className="w-3.5 h-3.5" />
            Start over
          </Button>
        </div>
      )}
    </Sidebar>
  );
}
