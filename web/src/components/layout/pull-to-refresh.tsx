"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useSyncHeaderPull } from "@/components/layout/header-brand-motion-provider";

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
}: PullToRefreshProps) {
  const {
    containerRef,
    pullDistance,
    refreshing,
    canRelease,
    progress,
    isDragging,
  } = usePullToRefresh(onRefresh);

  useSyncHeaderPull({
    progress,
    isDragging,
    refreshing,
  });

  const visible = pullDistance > 0 || refreshing;

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div
        aria-hidden
        className="flex w-full items-end justify-center overflow-hidden"
        style={{
          height: visible ? pullDistance : 0,
          transition:
            isDragging || refreshing
              ? "none"
              : "height 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="border-border/60 bg-card shadow-app-1 mb-1 flex size-9 items-center justify-center rounded-full border"
          style={{
            opacity: Math.min(1, progress * 1.4),
            transform: `scale(${
              (canRelease && !refreshing ? 1.05 : 1) * (0.6 + progress * 0.4)
            })`,
            transition: isDragging ? "none" : "opacity 0.2s, transform 0.2s",
          }}
        >
          <Loader2
            className={cn(
              "text-muted-foreground size-[18px]",
              refreshing && "animate-spin"
            )}
            style={
              refreshing
                ? undefined
                : { transform: `rotate(${progress * 300}deg)` }
            }
            strokeWidth={2.25}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
