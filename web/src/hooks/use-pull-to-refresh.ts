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
/** Minimum downward movement before pull steals the gesture (keeps taps as clicks). */
const PULL_ACTIVATION_PX = 12;
const DEFAULT_SCROLL_SELECTOR = ".app-shell-main";
const DEFAULT_MIN_REFRESH_MS = 600;

interface UsePullToRefreshOptions {
  threshold?: number;
  maxPull?: number;
  scrollSelector?: string;
  /** Minimum refresh duration so the header spin is perceptible on fast loads. */
  minRefreshDuration?: number;
}

function dampedPull(dy: number, maxPull: number): number {
  const resistance = 0.55;
  return maxPull * (1 - Math.exp(-(dy * resistance) / maxPull));
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
  const pullActiveRef = useRef(false);
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
      pullActiveRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startYRef.current === null || refreshingRef.current) return;

      const dy = e.touches[0]!.clientY - startYRef.current;
      if (dy <= 0) {
        if (pullDistanceRef.current > 0) setPull(0);
        setIsDragging(false);
        pullActiveRef.current = false;
        return;
      }

      if (!isAtScrollTop()) {
        startYRef.current = null;
        pullActiveRef.current = false;
        return;
      }

      if (!pullActiveRef.current && dy < PULL_ACTIVATION_PX) return;

      pullActiveRef.current = true;
      e.preventDefault();
      setIsDragging(true);
      setPull(dampedPull(dy, maxPull));
    };

    const onTouchEnd = async () => {
      if (startYRef.current === null) return;
      const wasPull = pullActiveRef.current;
      startYRef.current = null;
      pullActiveRef.current = false;
      setIsDragging(false);

      if (!wasPull) return;

      const distance = pullDistanceRef.current;
      if (distance < threshold) {
        setPull(0);
        return;
      }

      setRefreshing(true);
      setPull(0);
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

  const progress = Math.min(1, pullDistance / threshold);
  const canRelease = pullDistance >= threshold;

  return {
    containerRef,
    pullDistance,
    refreshing,
    canRelease,
    progress,
    isDragging,
  };
}
