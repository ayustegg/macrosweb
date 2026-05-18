"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export const TAB_ROUTES = ["/", "/foods", "/recipes", "/profile"] as const;

/** Prefetch main tab routes on mount and on demand (hover / touch). */
export function useTabPrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const href of TAB_ROUTES) {
      router.prefetch(href);
    }
  }, [router]);

  return useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router]
  );
}
