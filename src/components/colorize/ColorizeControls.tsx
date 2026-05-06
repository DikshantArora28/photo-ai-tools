"use client";

import { Button } from "@/components/ui/Button";
import { DownloadPanel } from "@/components/shared/DownloadPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { Wand2, RotateCcw } from "lucide-react";

interface ColorizeControlsProps {
  onProcess: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorizeControls({ onProcess }: ColorizeControlsProps) {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const resetImage = useImageStore((s) => s.reset);

  return (
    <Sidebar title="Colorize B&W">
      <div className="space-y-2.5">
        <p className="text-xs text-gray-600 leading-relaxed">
          Upload a black & white photo and our AI will automatically add realistic, natural colors.
        </p>

        <Button
          onClick={onProcess}
          disabled={!original || isProcessing}
          className="w-full"
          size="md"
        >
          <Wand2 className="w-4 h-4" />
          {isProcessing ? "AI Processing..." : "Colorize with AI"}
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
