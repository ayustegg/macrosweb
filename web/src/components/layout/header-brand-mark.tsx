"use client";

import { BrandMark } from "@/components/features/brand/brand-mark";
import { useMainScrollRotation } from "@/hooks/use-main-scroll-rotation";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";
import { cn } from "@/lib/utils";

export function HeaderBrandMark({ size = 24 }: { size?: number }) {
  const scrollRotation = useMainScrollRotation();
  const { isNavigating } = useTabNavigation();

  return (
    <span
      className={cn(
        "inline-flex will-change-transform",
        isNavigating && "animate-brand-spin"
      )}
      style={
        isNavigating ? undefined : { transform: `rotate(${scrollRotation}deg)` }
      }
      aria-hidden
    >
      <BrandMark size={size} />
    </span>
  );
}
