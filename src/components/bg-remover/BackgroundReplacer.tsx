"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { BackgroundType } from "@/types/tools";

interface BackgroundReplacerProps {
  bgType: BackgroundType;
  onBgTypeChange: (type: BackgroundType) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  bgGradient: string;
  onBgGradientChange: (gradient: string) => void;
  onBgImageUpload: (url: string) => void;
}

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const bgTypes: { value: BackgroundType; label: string }[] = [
  { value: "transparent", label: "None" },
  { value: "color", label: "Color" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image" },
];

export function BackgroundReplacer({
  bgType,
  onBgTypeChange,
  bgColor,
  onBgColorChange,
  bgGradient,
  onBgGradientChange,
  onBgImageUpload,
}: BackgroundReplacerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onBgImageUpload(url);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Background</h4>

      <div className="grid grid-cols-4 gap-1.5">
        {bgTypes.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onBgTypeChange(value)}
            className={cn(
              "text-xs py-1.5 rounded-md border transition-colors",
              bgType === value
                ? "border-violet-500 bg-violet-50 text-violet-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {bgType === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => onBgColorChange(e.target.value)}
            className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => onBgColorChange(e.target.value)}
            className="flex-1 text-xs px-2 py-1.5 rounded-md border border-gray-300 font-mono"
          />
        </div>
      )}

      {bgType === "gradient" && (
        <div className="grid grid-cols-3 gap-2">
          {gradients.map((g) => (
            <button
              key={g}
              onClick={() => onBgGradientChange(g)}
              className={cn(
                "h-10 rounded-lg border-2 transition-all",
                bgGradient === g ? "border-violet-500 scale-105" : "border-transparent"
              )}
              style={{ background: g }}
            />
          ))}
        </div>
      )}

      {bgType === "image" && (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-violet-400 hover:bg-violet-50/50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload background
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
