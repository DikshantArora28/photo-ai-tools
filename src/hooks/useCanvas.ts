"use client";

import { useRef, useEffect, useCallback } from "react";

interface UseCanvasOptions {
  width: number;
  height: number;
}

export function useCanvas({ width, height }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    ctxRef.current = canvas.getContext("2d", { willReadFrequently: true });
  }, [width, height]);

  const drawImage = useCallback((img: HTMLImageElement) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  const drawImageData = useCallback((imageData: ImageData) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const getImageData = useCallback((): ImageData | null => {
    const ctx = ctxRef.current;
    if (!ctx) return null;
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  const clear = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  return { canvasRef, ctxRef, drawImage, drawImageData, getImageData, clear };
}
