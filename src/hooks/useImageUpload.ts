"use client";

import { useCallback, useState } from "react";
import { validateImageFile, getImageDimensions } from "@/lib/utils/fileValidation";
import { blobToObjectURL } from "@/lib/utils/imageConversion";
import { useImageStore } from "@/store/useImageStore";
import type { ImageFile } from "@/types/image";

export function useImageUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setOriginal = useImageStore((s) => s.setOriginal);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error!);
        return null;
      }

      setIsLoading(true);
      try {
        const url = blobToObjectURL(file);
        const { width, height } = await getImageDimensions(url);
        const imageFile: ImageFile = {
          file,
          url,
          width,
          height,
          name: file.name,
          type: file.type,
          size: file.size,
        };
        setOriginal(imageFile);
        return imageFile;
      } catch {
        setError("Failed to load image. The file may be corrupted.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setOriginal]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
    },
    [upload]
  );

  return { upload, handleDrop, handleFileInput, isLoading, error, clearError: () => setError(null) };
}
