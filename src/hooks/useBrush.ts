"use client";

import { useRef, useCallback } from "react";
import type { BrushMode } from "@/types/image";

interface UseBrushOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  brushSize: number;
  brushHardness: number;
  mode: BrushMode;
  onStrokeEnd?: (maskData: ImageData) => void;
}

export function useBrush({
  canvasRef,
  maskCanvasRef,
  brushSize,
  brushHardness,
  mode,
  onStrokeEnd,
}: UseBrushOptions) {
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getCanvasPos = useCallback(
    (e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const paint = useCallback(
    (x: number, y: number) => {
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return;
      const ctx = maskCanvas.getContext("2d");
      if (!ctx) return;

      ctx.globalCompositeOperation =
        mode === "erase" ? "destination-out" : "source-over";

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize / 2);
      const alpha = mode === "restore" ? 1 : 1;
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(
        brushHardness / 100,
        `rgba(255, 255, 255, ${alpha})`
      );
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [maskCanvasRef, brushSize, brushHardness, mode]
  );

  const interpolate = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / (brushSize / 4)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        paint(from.x + dx * t, from.y + dy * t);
      }
    },
    [paint, brushSize]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDrawing.current = true;
      const pos = getCanvasPos(e);
      lastPos.current = pos;
      paint(pos.x, pos.y);
    },
    [getCanvasPos, paint]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing.current) return;
      const pos = getCanvasPos(e);
      if (lastPos.current) {
        interpolate(lastPos.current, pos);
      }
      lastPos.current = pos;
    },
    [getCanvasPos, interpolate]
  );

  const onMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    if (onStrokeEnd && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d");
      if (ctx) {
        const maskData = ctx.getImageData(
          0,
          0,
          maskCanvasRef.current.width,
          maskCanvasRef.current.height
        );
        onStrokeEnd(maskData);
      }
    }
  }, [onStrokeEnd, maskCanvasRef]);

  return { onMouseDown, onMouseMove, onMouseUp };
}
