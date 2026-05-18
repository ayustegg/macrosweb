"use client";

import Link from "next/link";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";
import { useHeaderBrandMotion } from "@/components/layout/header-brand-motion-provider";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";
import { useTabPrefetch } from "@/hooks/use-tab-prefetch";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { isNavigating, startNavigation } = useTabNavigation();
  const prefetchTab = useTabPrefetch();
  const { rotation, transition, dateWobble } = useHeaderBrandMotion();

  return (
    <header
      className="border-border/80 bg-background/90 w-full border-b backdrop-blur-xl backdrop-saturate-150"
      aria-busy={isNavigating}
    >
      <div className="px-page flex w-full items-center gap-2.5 py-2.5">
        <Link
          href="/"
          prefetch
          className="focus-visible:ring-ring flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2"
          onMouseEnter={() => prefetchTab("/")}
          onClick={() => startNavigation("/")}
        >
          <span
            className={cn(
              "inline-flex will-change-transform",
              dateWobble && "animate-brand-face"
            )}
            style={
              dateWobble
                ? undefined
                : {
                    transform: `rotate(${rotation}deg)`,
                    transition: transition
                      ? "transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)"
                      : "none",
                  }
            }
            aria-hidden
          >
            <BrandMark size={24} />
          </span>
          <span className="text-[19px] font-bold tracking-tight">
            {APP_NAME}
          </span>
        </Link>
      </div>
    </header>
  );
}
