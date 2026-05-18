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
const DATE_NAV_MIN_MS = 520;
const DATE_NAV_MAX_MS = 8000;

/** Slow ease-back to rest angle after tab/date/refresh spin. */
export const SETTLE_ROTATION_MS = 2800;
export const SETTLE_ROTATION_EASING = "cubic-bezier(0.12, 1, 0.28, 1)";

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
  setPullState: (state: PullBrandState) => void;
  startDateNavigation: (targetDate: string) => void;
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
  const [settleHold, setSettleHold] = useState<number | null>(null);
  const [isSettling, setIsSettling] = useState(false);

  const spinOriginRef = useRef(0);
  const spinAngleRef = useRef(0);
  const wasSpinningRef = useRef(false);
  const dateTargetRef = useRef<string | null>(null);
  const dateStartedRef = useRef(0);

  const completeDateNavigation = useCallback(() => {
    dateTargetRef.current = null;
    setDateNavigating(false);
  }, []);

  const spinning =
    !reducedMotion && (isNavigating || pull.refreshing || dateNavigating);

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

  const value: HeaderBrandMotionContextValue = {
    rotation,
    transition,
    settleDurationMs: SETTLE_ROTATION_MS,
    settleEasing: SETTLE_ROTATION_EASING,
    isDateNavigating: dateNavigating,
    setPullState: setPull,
    startDateNavigation,
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
