"use client";

import { useRef, useState, useCallback } from "react";

interface SwipeDeleteHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface UseSwipeDeleteReturn {
  offsetX: number;
  handlers: SwipeDeleteHandlers;
}

export function useSwipeDelete(
  onDelete: () => void,
  threshold = 80
): UseSwipeDeleteReturn {
  const startXRef = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0]!.clientX;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startXRef.current === null) return;
      const dx = e.touches[0]!.clientX - startXRef.current;
      if (dx < 0) {
        e.preventDefault();
        setOffsetX(Math.max(dx, -threshold - 20));
      }
    },
    [threshold]
  );

  const handleTouchEnd = useCallback(() => {
    if (offsetX <= -threshold) {
      onDelete();
    }
    setOffsetX(0);
    startXRef.current = null;
  }, [offsetX, onDelete, threshold]);

  return {
    offsetX,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
