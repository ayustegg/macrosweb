"use client";

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

  const contentOffset =
    pullDistance > 0 && !refreshing ? pullDistance * 0.42 : 0;

  const showPullHint = pullDistance > 0 && !refreshing;

  return (
    <div
      ref={containerRef}
      className={cn("relative min-h-0 w-full", className)}
    >
      <div
        aria-hidden
        className="px-page pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-hidden"
        style={{
          height: showPullHint ? Math.min(pullDistance * 0.55, 40) : 0,
          opacity: showPullHint ? Math.min(1, progress * 1.15) : 0,
          transition: isDragging
            ? "none"
            : "height 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease",
        }}
      >
        <div
          className="mt-1.5 h-[3px] rounded-full"
          style={{
            width: `${Math.min(100, 12 + progress * 95)}%`,
            background: canRelease
              ? "var(--macro-kcal)"
              : "color-mix(in oklch, var(--macro-kcal) 55%, var(--muted-foreground))",
            boxShadow: canRelease
              ? "0 0 10px color-mix(in oklch, var(--macro-kcal) 40%, transparent)"
              : undefined,
            transition: isDragging
              ? "none"
              : "width 0.2s ease, background 0.2s ease",
          }}
        />
      </div>

      <div
        style={{
          transform:
            contentOffset > 0 ? `translateY(${contentOffset}px)` : undefined,
          transition: isDragging
            ? "none"
            : "transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
