"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMainScrollRotation } from "@/hooks/use-main-scroll-rotation";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";

const PULL_ROTATION_DEG = 300;
const SPIN_DEG_PER_SEC = 420;
export const DATE_NAV_MIN_MS = 520;
const DATE_NAV_MAX_MS = 8000;

/** Slow ease-back to rest angle after tab/date/refresh spin. */
export const SETTLE_ROTATION_MS = 2800;
export const SETTLE_ROTATION_EASING = "cubic-bezier(0.12, 1, 0.28, 1)";

/** Scripted ring preview timings — drain rings to 0, hold, then refill. */
const RING_DRAIN_MS = 280;
const RING_HOLD_MS = 80;
const RING_REFILL_MS = 720;
const RING_DRAIN_EASING = (t: number) => 1 - Math.pow(1 - t, 3);
const RING_REFILL_EASING = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface PullBrandState {
  progress: number;
  isDragging: boolean;
  refreshing: boolean;
}

interface HeaderBrandMotionContextValue {
  rotation: number;
  transition: boolean;
  settleDurationMs: number;
  settleEasing: string;
  isDateNavigating: boolean;
  isHomeRefreshing: boolean;
  /** Date change or header home refresh — show today skeleton. */
  isTodayLoading: boolean;
  homeRefreshStartedRef: React.RefObject<number>;
  pullProgress: number;
  pullIsDragging: boolean;
  pullRefreshing: boolean;
  /** Bumps when pull-to-refresh finishes — replay macro ring fill. */
  pullRefreshGeneration: number;
  /**
   * Unified 0–1 ring preview progress for all refresh sources.
   * - `undefined` when idle (rings show real value).
   * - During pull drag: matches `pullProgress`.
   * - During pull refresh: stays at 1 until replay.
   * - During home refresh / date nav: scripted drain (1→0) → hold → refill (0→1).
   */
  ringPreviewProgress: number | undefined;
  setPullState: (state: PullBrandState) => void;
  startDateNavigation: (targetDate: string) => void;
  startHomeRefresh: () => void;
  completeHomeRefresh: () => void;
}

const HeaderBrandMotionContext =
  createContext<HeaderBrandMotionContextValue | null>(null);

function DateNavigationSync({
  dateNavigating,
  dateTargetRef,
  dateStartedRef,
  onComplete,
}: {
  dateNavigating: boolean;
  dateTargetRef: React.RefObject<string | null>;
  dateStartedRef: React.RefObject<number>;
  onComplete: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!dateNavigating || pathname !== "/") return;
    const target = dateTargetRef.current;
    if (!target || searchParams.get("date") !== target) return;

    const elapsed = Date.now() - dateStartedRef.current;
    const remaining = Math.max(0, DATE_NAV_MIN_MS - elapsed);
    const timer = window.setTimeout(onComplete, remaining);
    return () => window.clearTimeout(timer);
  }, [
    dateNavigating,
    dateStartedRef,
    dateTargetRef,
    onComplete,
    pathname,
    searchParams,
  ]);

  return null;
}

export function HeaderBrandMotionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const scrollRotation = useMainScrollRotation();
  const { isNavigating } = useTabNavigation();
  const reducedMotion = prefersReducedMotion();

  const [pull, setPull] = useState<PullBrandState>({
    progress: 0,
    isDragging: false,
    refreshing: false,
  });
  const [spinAngle, setSpinAngle] = useState(0);
  const [dateNavigating, setDateNavigating] = useState(false);
  const [homeRefreshing, setHomeRefreshing] = useState(false);
  const [pullRefreshGeneration, setPullRefreshGeneration] = useState(0);
  const [settleHold, setSettleHold] = useState<number | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [scriptedRingPreview, setScriptedRingPreview] = useState<number | null>(
    null
  );

  const spinOriginRef = useRef(0);
  const spinAngleRef = useRef(0);
  const wasSpinningRef = useRef(false);
  const wasPullRefreshingRef = useRef(false);
  const dateTargetRef = useRef<string | null>(null);
  const dateStartedRef = useRef(0);
  const homeRefreshStartedRef = useRef(0);

  const completeDateNavigation = useCallback(() => {
    dateTargetRef.current = null;
    setDateNavigating(false);
  }, []);

  const completeHomeRefresh = useCallback(() => {
    setHomeRefreshing(false);
  }, []);

  const startHomeRefresh = useCallback(() => {
    homeRefreshStartedRef.current = Date.now();
    setHomeRefreshing(true);
  }, []);

  const isTodayLoading = dateNavigating || homeRefreshing;

  const spinning =
    !reducedMotion &&
    (isNavigating || pull.refreshing || dateNavigating || homeRefreshing);

  const pullRotation =
    scrollRotation +
    (pull.progress > 0 ? pull.progress * PULL_ROTATION_DEG : 0);
  const idleRotation = pull.progress > 0 ? pullRotation : scrollRotation;

  useEffect(() => {
    if (!spinning) return;

    spinOriginRef.current = settleHold !== null ? settleHold : idleRotation;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const deg =
        spinOriginRef.current + ((now - start) / 1000) * SPIN_DEG_PER_SEC;
      spinAngleRef.current = deg;
      setSpinAngle(deg);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [spinning, settleHold, idleRotation]);

  useEffect(() => {
    if (!(wasSpinningRef.current && !spinning)) {
      wasSpinningRef.current = spinning;
      return;
    }
    wasSpinningRef.current = spinning;

    if (reducedMotion) return;

    const angle = spinAngleRef.current;
    let settleTimer = 0;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      setSettleHold(angle);
      inner = window.requestAnimationFrame(() => {
        setSettleHold(null);
        setIsSettling(true);
        settleTimer = window.setTimeout(
          () => setIsSettling(false),
          SETTLE_ROTATION_MS
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
      window.clearTimeout(settleTimer);
      setIsSettling(false);
      setSettleHold(null);
    };
  }, [reducedMotion, spinning]);

  useEffect(() => {
    if (!dateNavigating) return;

    const failSafe = window.setTimeout(completeDateNavigation, DATE_NAV_MAX_MS);
    return () => window.clearTimeout(failSafe);
  }, [completeDateNavigation, dateNavigating]);

  useEffect(() => {
    if (!homeRefreshing) return;

    const failSafe = window.setTimeout(completeHomeRefresh, DATE_NAV_MAX_MS);
    return () => window.clearTimeout(failSafe);
  }, [completeHomeRefresh, homeRefreshing]);

  // Scripted ring drain→hold→refill while the user clicks the brand to refresh.
  // Date navigation lets rings interpolate naturally from old → new value.
  // Pull drag/refresh drives previewProgress directly, so we skip when pulling.
  const scriptedActive =
    homeRefreshing && !pull.isDragging && !pull.refreshing && !reducedMotion;

  useEffect(() => {
    if (!scriptedActive) return;

    let frame = 0;
    let cancelled = false;
    const start = performance.now();
    const drainEnd = start + RING_DRAIN_MS;
    const holdEnd = drainEnd + RING_HOLD_MS;

    const tick = (now: number) => {
      if (cancelled) return;
      if (now < drainEnd) {
        const t = (now - start) / RING_DRAIN_MS;
        setScriptedRingPreview(1 - RING_DRAIN_EASING(t));
      } else if (now < holdEnd) {
        setScriptedRingPreview(0);
      } else {
        const t = Math.min(1, (now - holdEnd) / RING_REFILL_MS);
        setScriptedRingPreview(RING_REFILL_EASING(t));
        if (t >= 1) {
          setScriptedRingPreview(null);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      setScriptedRingPreview(null);
    };
  }, [scriptedActive]);

  useEffect(() => {
    if (!(wasPullRefreshingRef.current && !pull.refreshing)) {
      wasPullRefreshingRef.current = pull.refreshing;
      return;
    }
    wasPullRefreshingRef.current = pull.refreshing;

    const frame = requestAnimationFrame(() => {
      setPullRefreshGeneration((g) => g + 1);
    });
    return () => cancelAnimationFrame(frame);
  }, [pull.refreshing]);

  const rotation = useMemo(() => {
    if (settleHold !== null) return settleHold;
    if (spinning) return spinAngle;
    return idleRotation;
  }, [settleHold, spinning, spinAngle, idleRotation]);

  const transition = isSettling && !pull.isDragging;

  const startDateNavigation = useCallback(
    (targetDate: string) => {
      if (reducedMotion) return;
      dateTargetRef.current = targetDate;
      dateStartedRef.current = Date.now();
      setDateNavigating(true);
    },
    [reducedMotion]
  );

  const ringPreviewProgress: number | undefined =
    scriptedRingPreview !== null
      ? scriptedRingPreview
      : pull.refreshing
        ? 1
        : pull.isDragging
          ? pull.progress
          : undefined;

  const value: HeaderBrandMotionContextValue = {
    rotation,
    transition,
    settleDurationMs: SETTLE_ROTATION_MS,
    settleEasing: SETTLE_ROTATION_EASING,
    isDateNavigating: dateNavigating,
    isHomeRefreshing: homeRefreshing,
    isTodayLoading,
    homeRefreshStartedRef,
    pullProgress: pull.progress,
    pullIsDragging: pull.isDragging,
    pullRefreshing: pull.refreshing,
    pullRefreshGeneration,
    ringPreviewProgress,
    setPullState: setPull,
    startDateNavigation,
    startHomeRefresh,
    completeHomeRefresh,
  };

  return (
    <HeaderBrandMotionContext.Provider value={value}>
      <Suspense fallback={null}>
        <DateNavigationSync
          dateNavigating={dateNavigating}
          dateTargetRef={dateTargetRef}
          dateStartedRef={dateStartedRef}
          onComplete={completeDateNavigation}
        />
      </Suspense>
      {children}
    </HeaderBrandMotionContext.Provider>
  );
}

export function useHeaderBrandMotion(): HeaderBrandMotionContextValue {
  const ctx = useContext(HeaderBrandMotionContext);
  if (!ctx) {
    throw new Error(
      "useHeaderBrandMotion must be used within HeaderBrandMotionProvider"
    );
  }
  return ctx;
}

const EMPTY_PULL: PullBrandState = {
  progress: 0,
  isDragging: false,
  refreshing: false,
};

/** Sync pull-to-refresh progress with the header logo. */
export function useSyncHeaderPull(state: PullBrandState): void {
  const { setPullState } = useHeaderBrandMotion();
  const prevRef = useRef(EMPTY_PULL);

  useEffect(() => {
    const prev = prevRef.current;
    if (
      prev.progress === state.progress &&
      prev.isDragging === state.isDragging &&
      prev.refreshing === state.refreshing
    ) {
      return;
    }
    prevRef.current = state;
    setPullState(state);
  }, [setPullState, state]);
}
