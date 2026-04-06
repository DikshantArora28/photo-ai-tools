"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppStore } from "@/store/useAppStore";

export function ProcessingOverlay() {
  const isProcessing = useAppStore((s) => s.isProcessing);
  const progress = useAppStore((s) => s.processingProgress);
  const message = useAppStore((s) => s.processingMessage);

  if (!isProcessing) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white shadow-lg border border-gray-100 w-72">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-2 w-full">
          <p className="text-sm font-medium text-gray-900">
            {message || "Processing..."}
          </p>
          {progress > 0 && <ProgressBar progress={progress} />}
        </div>
      </div>
    </div>
  );
}
