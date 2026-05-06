"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useImageStore } from "@/store/useImageStore";
import { downloadBlob, canvasToBlob, loadImage } from "@/lib/utils/imageConversion";

export function DownloadPanel() {
  const processed = useImageStore((s) => s.processed);
  const original = useImageStore((s) => s.original);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [quality, setQuality] = useState(92);

  const handleDownload = async () => {
    if (!processed) return;

    if (format === "png") {
      const filename = original
        ? original.name.replace(/\.[^.]+$/, "") + "_processed.png"
        : "processed.png";
      downloadBlob(processed.blob, filename);
    } else {
      const img = await loadImage(processed.url);
      const canvas = document.createElement("canvas");
      canvas.width = processed.width;
      canvas.height = processed.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, "jpeg", quality / 100);
      const filename = original
        ? original.name.replace(/\.[^.]+$/, "") + "_processed.jpg"
        : "processed.jpg";
      downloadBlob(blob, filename);
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t border-gray-200">
      <div className="flex gap-1.5 items-center">
        <button
          onClick={() => setFormat("png")}
          className={`flex-1 text-xs py-1 rounded-md border transition-colors ${
            format === "png"
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          PNG
        </button>
        <button
          onClick={() => setFormat("jpeg")}
          className={`flex-1 text-xs py-1 rounded-md border transition-colors ${
            format === "jpeg"
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          JPG
        </button>
      </div>

      {format === "jpeg" && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Quality</span>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-violet-600"
          />
          <span className="tabular-nums w-7 text-right">{quality}%</span>
        </div>
      )}

      <Button
        onClick={handleDownload}
        disabled={!processed}
        className="w-full"
        size="sm"
      >
        <Download className="w-3.5 h-3.5" />
        Download {format.toUpperCase()}
      </Button>
    </div>
  );
}
