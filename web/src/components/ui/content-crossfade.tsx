"use client";

import { type ReactNode } from "react";
import { CONTENT_FADE_TRANSITION } from "@/lib/content-fade";
import { cn } from "@/lib/utils";

interface ContentCrossfadeProps {
  /** When true, shows `b`; when false, shows `a`. */
  showB: boolean;
  a: ReactNode;
  b: ReactNode;
  className?: string;
}

/**
 * Crossfades between two panels (e.g. skeleton ↔ loaded content).
 * Both stay mounted; opacity transitions avoid abrupt swaps.
 */
export function ContentCrossfade({
  showB,
  a,
  b,
  className,
}: ContentCrossfadeProps) {
  return (
    <div className={cn("grid [&>*]:col-start-1 [&>*]:row-start-1", className)}>
      <div
        aria-hidden={showB}
        className={cn(
          CONTENT_FADE_TRANSITION,
          "min-h-0",
          showB
            ? "pointer-events-none invisible z-0 opacity-0"
            : "z-10 opacity-100"
        )}
      >
        {a}
      </div>
      <div
        aria-hidden={!showB}
        className={cn(
          CONTENT_FADE_TRANSITION,
          "min-h-0",
          showB
            ? "z-10 opacity-100"
            : "pointer-events-none invisible z-0 opacity-0"
        )}
      >
        {b}
      </div>
    </div>
  );
}
