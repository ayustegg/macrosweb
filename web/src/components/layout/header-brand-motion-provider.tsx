"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMainScrollRotation } from "@/hooks/use-main-scroll-rotation";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";

const PULL_ROTATION_DEG = 300;
const SPIN_DEG_PER_SEC = 420;
const DATE_WOBBLE_MS = 520;

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
  dateWobble: boolean;
  setPullState: (state: PullBrandState) => void;
  triggerDateChange: () => void;
}

const HeaderBrandMotionContext =
  createContext<HeaderBrandMotionContextValue | null>(null);

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
  const [dateWobble, setDateWobble] = useState(false);
  const [settleFrom, setSettleFrom] = useState<number | null>(null);

  const spinOriginRef = useRef(0);
  const wasSpinningRef = useRef(false);

  const spinning =
    !reducedMotion && !dateWobble && (isNavigating || pull.refreshing);

  const pullRotation =
    scrollRotation +
    (pull.progress > 0 ? pull.progress * PULL_ROTATION_DEG : 0);
  const idleRotation = pull.progress > 0 ? pullRotation : scrollRotation;

  useEffect(() => {
    if (!spinning) return;

    spinOriginRef.current = settleFrom !== null ? settleFrom : idleRotation;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const deg =
        spinOriginRef.current + ((now - start) / 1000) * SPIN_DEG_PER_SEC;
      setSpinAngle(deg);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [spinning, settleFrom, idleRotation]);

  useEffect(() => {
    if (wasSpinningRef.current && !spinning) {
      setSettleFrom(spinAngle);
      let outer = 0;
      let inner = 0;
      outer = window.requestAnimationFrame(() => {
        inner = window.requestAnimationFrame(() => setSettleFrom(null));
      });
      return () => {
        window.cancelAnimationFrame(outer);
        window.cancelAnimationFrame(inner);
      };
    }
    wasSpinningRef.current = spinning;
  }, [spinning, spinAngle]);

  const rotation = useMemo(() => {
    if (dateWobble) return scrollRotation;
    if (settleFrom !== null) return settleFrom;
    if (spinning) return spinAngle;
    return idleRotation;
  }, [
    dateWobble,
    scrollRotation,
    settleFrom,
    spinning,
    spinAngle,
    idleRotation,
  ]);

  const transition =
    !dateWobble && !pull.isDragging && (settleFrom !== null || !spinning);

  const triggerDateChange = useCallback(() => {
    if (reducedMotion) return;
    setDateWobble(true);
    window.setTimeout(() => setDateWobble(false), DATE_WOBBLE_MS);
  }, [reducedMotion]);

  const value: HeaderBrandMotionContextValue = {
    rotation,
    transition,
    dateWobble,
    setPullState: setPull,
    triggerDateChange,
  };

  return (
    <HeaderBrandMotionContext.Provider value={value}>
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
