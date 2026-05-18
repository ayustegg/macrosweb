"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type RefObject,
} from "react";

const DEFAULT_THRESHOLD = 64;
const DEFAULT_MAX_PULL = 96;
const DEFAULT_SCROLL_SELECTOR = ".app-shell-main";
const DEFAULT_MIN_REFRESH_MS = 600;

interface UsePullToRefreshOptions {
  threshold?: number;
  maxPull?: number;
  scrollSelector?: string;
  /** Minimum time the spinner stays visible after release. */
  minRefreshDuration?: number;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface UsePullToRefreshReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  pullDistance: number;
  refreshing: boolean;
  canRelease: boolean;
  progress: number;
  isDragging: boolean;
}

export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  options: UsePullToRefreshOptions = {}
): UsePullToRefreshReturn {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const maxPull = options.maxPull ?? DEFAULT_MAX_PULL;
  const scrollSelector = options.scrollSelector ?? DEFAULT_SCROLL_SELECTOR;
  const minRefreshDuration =
    options.minRefreshDuration ?? DEFAULT_MIN_REFRESH_MS;

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  const refreshingRef = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
    refreshingRef.current = refreshing;
    pullDistanceRef.current = pullDistance;
  }, [onRefresh, refreshing, pullDistance]);

  const setPull = useCallback((distance: number) => {
    pullDistanceRef.current = distance;
    setPullDistance(distance);
  }, []);

  const getScrollParent = useCallback((): HTMLElement | null => {
    const el = containerRef.current;
    if (!el) return null;
    return el.closest(scrollSelector) as HTMLElement | null;
  }, [scrollSelector]);

  const isAtScrollTop = useCallback(() => {
    const scrollParent = getScrollParent();
    return !scrollParent || scrollParent.scrollTop <= 0;
  }, [getScrollParent]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || !isAtScrollTop()) return;
      startYRef.current = e.touches[0]!.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null || refreshingRef.current) return;

      const dy = e.touches[0]!.clientY - startYRef.current;
      if (dy <= 0) {
        if (pullDistanceRef.current > 0) setPull(0);
        setIsDragging(false);
        return;
      }

      if (!isAtScrollTop()) return;

      e.preventDefault();
      setIsDragging(true);
      const damped = Math.min(maxPull, dy * 0.45);
      setPull(damped);
    };

    const onTouchEnd = async () => {
      if (startYRef.current === null) return;
      startYRef.current = null;
      setIsDragging(false);

      const distance = pullDistanceRef.current;
      if (distance < threshold) {
        setPull(0);
        return;
      }

      setRefreshing(true);
      setPull(threshold);
      try {
        await Promise.all([
          Promise.resolve(onRefreshRef.current()),
          wait(minRefreshDuration),
        ]);
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isAtScrollTop, maxPull, minRefreshDuration, setPull, threshold]);

  const activeDistance = refreshing ? threshold : pullDistance;
  const progress = Math.min(1, activeDistance / threshold);
  const canRelease = pullDistance >= threshold;

  return {
    containerRef,
    pullDistance: activeDistance,
    refreshing,
    canRelease,
    progress,
    isDragging,
  };
}
