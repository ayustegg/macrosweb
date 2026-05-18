"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { isPwaStandalone } from "@/lib/pwa-standalone";
import { cn } from "@/lib/utils";

const SPLASH_MS = 1000;
const FADE_MS = 180;

function subscribeStandalone(onStoreChange: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  const mqFull = window.matchMedia("(display-mode: fullscreen)");
  mq.addEventListener("change", onStoreChange);
  mqFull.addEventListener("change", onStoreChange);
  return () => {
    mq.removeEventListener("change", onStoreChange);
    mqFull.removeEventListener("change", onStoreChange);
  };
}

function getStandaloneSnapshot() {
  return isPwaStandalone();
}

function clearSplashPendingClass(): void {
  document.documentElement.classList.remove("pwa-splash-pending");
}

/** Full-screen loader on every cold open of the installed PWA. */
export function PwaFirstLaunchSplash() {
  const isPwa = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    () => false
  );
  const [dismissed, setDismissed] = useState(false);
  const [exiting, setExiting] = useState(false);

  const visible = isPwa && !dismissed;

  useEffect(() => {
    if (isPwa) return;
    clearSplashPendingClass();
  }, [isPwa]);

  useEffect(() => {
    if (!visible) return;

    const fadeTimer = window.setTimeout(
      () => setExiting(true),
      SPLASH_MS - FADE_MS
    );
    const hideTimer = window.setTimeout(() => {
      clearSplashPendingClass();
      setDismissed(true);
    }, SPLASH_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      data-pwa-splash
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      className={cn(
        "bg-background fixed inset-0 z-[10000] flex items-center justify-center transition-opacity",
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <span className="animate-brand-spin inline-flex" aria-hidden>
        <BrandMark size={56} />
      </span>
    </div>
  );
}
