"use client";

import Link from "next/link";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";
import { useMainScrollRotation } from "@/hooks/use-main-scroll-rotation";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { isNavigating, startNavigation } = useTabNavigation();
  const scrollRotation = useMainScrollRotation();

  return (
    <header
      className="border-border/80 bg-background/90 w-full border-b backdrop-blur-xl backdrop-saturate-150"
      aria-busy={isNavigating}
    >
      <div className="px-page flex w-full items-center gap-2.5 py-2.5">
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2"
          onClick={() => startNavigation("/")}
        >
          <span
            className={cn(
              "inline-flex will-change-transform",
              isNavigating && "animate-brand-spin"
            )}
            style={
              isNavigating
                ? undefined
                : { transform: `rotate(${scrollRotation}deg)` }
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
