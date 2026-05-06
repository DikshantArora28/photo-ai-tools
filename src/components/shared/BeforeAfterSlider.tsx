"use client";

import { cn } from "@/lib/utils/cn";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, className }: BeforeAfterSliderProps) {
  return (
    <div className={cn("flex gap-4 w-full h-full items-center justify-center p-4", className)}>
      {/* Before - Left side */}
      <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
        <span className="px-3 py-1 rounded-full bg-gray-900/70 text-white text-xs font-semibold tracking-wide uppercase">
          Before
        </span>
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <img
            src={beforeSrc}
            alt="Before"
            className="w-full h-auto max-h-[calc(100vh-12rem)] object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* After - Right side */}
      <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
        <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold tracking-wide uppercase">
          After
        </span>
        <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 checkerboard">
          <img
            src={afterSrc}
            alt="After"
            className="w-full h-auto max-h-[calc(100vh-12rem)] object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
