"use client";

import { useState, useCallback, useRef } from "react";

interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function useZoomPan(minScale = 0.1, maxScale = 5) {
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setTransform((t) => ({
      ...t,
      scale: Math.min(t.scale * 1.2, maxScale),
    }));
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setTransform((t) => ({
      ...t,
      scale: Math.max(t.scale / 1.2, minScale),
    }));
  }, [minScale]);

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform((t) => ({
        ...t,
        scale: Math.max(minScale, Math.min(maxScale, t.scale * factor)),
      }));
    },
    [minScale, maxScale]
  );

  const onPanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        isPanning.current = true;
        panStart.current = { x: e.clientX - transform.offsetX, y: e.clientY - transform.offsetY };
      }
    },
    [transform.offsetX, transform.offsetY]
  );

  const onPanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setTransform((t) => ({
      ...t,
      offsetX: e.clientX - panStart.current.x,
      offsetY: e.clientY - panStart.current.y,
    }));
  }, []);

  const onPanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  return {
    transform,
    zoomIn,
    zoomOut,
    resetZoom,
    onWheel,
    onPanStart,
    onPanMove,
    onPanEnd,
    isPanning: isPanning.current,
  };
}
