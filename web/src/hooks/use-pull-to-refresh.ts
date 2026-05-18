"use client";

import { useRef, useState, useCallback } from "react";

interface PullToRefreshHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface UsePullToRefreshReturn {
  pulling: boolean;
  refreshing: boolean;
  handlers: PullToRefreshHandlers;
}

export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  threshold = 80
): UsePullToRefreshReturn {
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (typeof window !== "undefined" && window.scrollY === 0) {
      startYRef.current = e.touches[0]!.clientY;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startYRef.current === null || refreshing) return;
      const dy = e.touches[0]!.clientY - startYRef.current;
      const isPulling = dy > threshold / 2 && dy > 0;
      if (isPulling !== pullingRef.current) {
        pullingRef.current = isPulling;
        setPulling(isPulling);
      }
    },
    [refreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return;
    const wasPulling = pullingRef.current;
    startYRef.current = null;
    pullingRef.current = false;
    setPulling(false);

    if (wasPulling) {
      setRefreshing(true);
      try {
        await Promise.resolve(onRefresh());
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  return {
    pulling,
    refreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
