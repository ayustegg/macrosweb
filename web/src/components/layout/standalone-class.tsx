"use client";

import { useEffect } from "react";

/** Añade .standalone en <html> para safe areas en PWA iOS (fallback a display-mode). */
export function StandaloneClass() {
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");

    const apply = () => {
      const iosStandalone =
        "standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
      document.documentElement.classList.toggle(
        "standalone",
        mq.matches || iosStandalone
      );
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return null;
}
