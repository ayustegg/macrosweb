"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

const MIN_SPIN_MS = 520;
const MAX_SPIN_MS = 8000;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pathMatchesTarget(pathname: string, target: string): boolean {
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}

interface TabNavigationContextValue {
  isNavigating: boolean;
  startNavigation: (href: string) => void;
}

const TabNavigationContext = createContext<TabNavigationContextValue | null>(
  null
);

export function TabNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const targetRef = useRef<string | null>(null);
  const startedAtRef = useRef(0);

  const startNavigation = useCallback(
    (href: string) => {
      if (prefersReducedMotion()) return;
      if (pathMatchesTarget(pathname, href)) return;

      targetRef.current = href;
      startedAtRef.current = Date.now();
      setIsNavigating(true);
    },
    [pathname]
  );

  useEffect(() => {
    if (!isNavigating || !targetRef.current) return;

    if (!pathMatchesTarget(pathname, targetRef.current)) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_SPIN_MS - elapsed);

    const timer = window.setTimeout(() => {
      targetRef.current = null;
      setIsNavigating(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [pathname, isNavigating]);

  useEffect(() => {
    if (!isNavigating) return;

    const failSafe = window.setTimeout(() => {
      targetRef.current = null;
      setIsNavigating(false);
    }, MAX_SPIN_MS);

    return () => window.clearTimeout(failSafe);
  }, [isNavigating]);

  return (
    <TabNavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
    </TabNavigationContext.Provider>
  );
}

export function useTabNavigation(): TabNavigationContextValue {
  const ctx = useContext(TabNavigationContext);
  if (!ctx) {
    throw new Error(
      "useTabNavigation must be used within TabNavigationProvider"
    );
  }
  return ctx;
}
