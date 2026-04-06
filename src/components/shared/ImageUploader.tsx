"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ACCEPTED_EXTENSIONS } from "@/lib/utils/constants";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploaderProps {
  className?: string;
}

export function ImageUploader({ className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleDrop, handleFileInput, isLoading, error, clearError } = useImageUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      setIsDragOver(false);
      handleDrop(e);
    },
    [handleDrop]
  );

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full max-w-xl rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200",
          isDragOver
            ? "border-violet-500 bg-violet-50 scale-[1.02]"
            : "border-gray-300 bg-white hover:border-violet-400 hover:bg-violet-50/50"
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                isDragOver ? "bg-violet-200" : "bg-violet-100"
              )}
            >
              {isDragOver ? (
                <ImageIcon className="w-8 h-8 text-violet-600" />
              ) : (
                <Upload className="w-8 h-8 text-violet-600" />
              )}
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">
                {isDragOver ? "Drop your image here" : "Upload an image"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Drag & drop or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, GIF, WEBP, BMP, TIFF - Max 20MB
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            <span className="flex-1">{error}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearError();
              }}
              className="p-0.5 rounded hover:bg-red-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}
