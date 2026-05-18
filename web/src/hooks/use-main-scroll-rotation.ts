"use client";

import { useEffect, useRef, useState } from "react";

const MAIN_SELECTOR = ".app-shell-main";
const DEFAULT_DEG_PER_PX = 0.4;
/** Per-frame lerp toward scroll target (lower = silkier, higher = snappier). */
const SCROLL_SMOOTHING = 0.1;
const SETTLE_EPSILON = 0.03;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rotation (deg) tied to vertical scroll of the app shell main area. */
export function useMainScrollRotation(degPerPx = DEFAULT_DEG_PER_PX): number {
  const [rotation, setRotation] = useState(0);
  const displayedRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const main = document.querySelector(MAIN_SELECTOR);
    if (!main) return;

    const step = () => {
      rafRef.current = 0;
      const target = targetRef.current;
      let current = displayedRef.current;
      const diff = target - current;

      if (Math.abs(diff) < SETTLE_EPSILON) {
        current = target;
      } else {
        current += diff * SCROLL_SMOOTHING;
      }

      displayedRef.current = current;
      setRotation(current);

      if (Math.abs(target - current) >= SETTLE_EPSILON) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(step);
    };

    const onScroll = () => {
      targetRef.current = main.scrollTop * degPerPx;
      schedule();
    };

    targetRef.current = main.scrollTop * degPerPx;
    displayedRef.current = targetRef.current;
    setRotation(targetRef.current);

    main.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      main.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [degPerPx]);

  return rotation;
}
