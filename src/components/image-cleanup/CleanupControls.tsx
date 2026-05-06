"use client";

import { Button } from "@/components/ui/Button";
import { DownloadPanel } from "@/components/shared/DownloadPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { useImageStore } from "@/store/useImageStore";
import { useAppStore } from "@/store/useAppStore";
import { Wand2, RotateCcw } from "lucide-react";

interface CleanupControlsProps {
  onProcess: () => void;
}

export function CleanupControls({ onProcess }: CleanupControlsProps) {
  const original = useImageStore((s) => s.original);
  const processed = useImageStore((s) => s.processed);
  const isProcessing = useAppStore((s) => s.isProcessing);
  const resetImage = useImageStore((s) => s.reset);

  return (
    <Sidebar title="Photo Enhancer">
      <div className="space-y-2.5">
        <p className="text-xs text-gray-600 leading-relaxed">
          AI-powered photo enhancement: upscale, sharpen, and restore details for HD quality results.
        </p>

        <Button
          onClick={onProcess}
          disabled={!original || isProcessing}
          className="w-full"
          size="md"
        >
          <Wand2 className="w-4 h-4" />
          {isProcessing ? "AI Enhancing..." : "Enhance with AI"}
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
