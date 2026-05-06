"use client";

import { cn } from "@/lib/utils/cn";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  className?: string;
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, className }: BeforeAfterSliderProps) {
  return (
    <div className={cn("flex gap-3 w-full h-full items-center justify-center px-3 py-2", className)}>
      {/* Before - Left side */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0 max-h-[calc(100vh-5rem)]">
        <span className="px-2.5 py-0.5 rounded-full bg-gray-900/70 text-white text-[10px] font-semibold tracking-wide uppercase shrink-0">
          Before
        </span>
        <div className="w-full rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white flex-1 min-h-0 flex items-center justify-center">
          <img
            src={beforeSrc}
            alt="Before"
            className="max-w-full max-h-[calc(100vh-7rem)] object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* After - Right side */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0 max-h-[calc(100vh-5rem)]">
        <span className="px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-semibold tracking-wide uppercase shrink-0">
          After
        </span>
        <div className="w-full rounded-lg overflow-hidden shadow-md border border-gray-200 checkerboard flex-1 min-h-0 flex items-center justify-center">
          <img
            src={afterSrc}
            alt="After"
            className="max-w-full max-h-[calc(100vh-7rem)] object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
