"use client";

import { useEffect, useState } from "react";

const MAIN_SELECTOR = ".app-shell-main";
const DEFAULT_DEG_PER_PX = 0.45;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rotation (deg) tied to vertical scroll of the app shell main area. */
export function useMainScrollRotation(degPerPx = DEFAULT_DEG_PER_PX): number {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const main = document.querySelector(MAIN_SELECTOR);
    if (!main) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      setRotation(main.scrollTop * degPerPx);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    main.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      main.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [degPerPx]);

  return rotation;
}
