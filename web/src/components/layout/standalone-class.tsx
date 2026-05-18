"use client";

import { useEffect } from "react";
import { isPwaStandalone } from "@/lib/pwa-standalone";

/** Añade .standalone en <html> para safe areas en PWA iOS (fallback a display-mode). */
export function StandaloneClass() {
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");

    const apply = () => {
      document.documentElement.classList.toggle(
        "standalone",
        isPwaStandalone()
      );
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return null;
}
