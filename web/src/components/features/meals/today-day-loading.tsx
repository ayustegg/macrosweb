"use client";

import { useEffect, useState } from "react";
import { MultiMacroRing } from "@/components/features/macros/multi-macro-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTENT_FADE_TRANSITION } from "@/lib/content-fade";
import {
  COMPACT_MACRO_RING_PX,
  DAY_LOAD_RING_FILL_MS,
  DAY_LOAD_RING_STAGGER_MS,
  dayLoadRingIntroDurationMs,
} from "@/lib/macro-ring-layout";
import { cn } from "@/lib/utils";

interface MacroTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface MealSlotStub {
  id: string;
  name: string;
}

interface TodayDayLoadingProps {
  summary: MacroTotals;
  goal: MacroTotals | null;
  animationKey: string;
  mealSlots: MealSlotStub[];
}

function MacroChipSkeleton() {
  return (
    <span className="bg-muted/50 border-border/60 flex min-w-0 flex-col items-center gap-0.5 rounded-md border px-1 py-1">
      <span className="inline-flex items-center gap-0.5">
        <Skeleton className="size-1.5 shrink-0 rounded-full" />
        <Skeleton className="h-2 w-4 rounded-sm" />
      </span>
      <Skeleton className="h-[11px] w-7 rounded-sm" />
    </span>
  );
}

/** Fixed-size ring slot — same box as `DailyMacroSummary` collapsed row. */
function MacroRingSlot({
  summary,
  goal,
  animationKey,
}: {
  summary: MacroTotals;
  goal: MacroTotals;
  animationKey: string;
}) {
  return (
    <div
      className="macro-ring-slot shrink-0"
      style={{ width: COMPACT_MACRO_RING_PX, height: COMPACT_MACRO_RING_PX }}
    >
      <MultiMacroRing
        key={animationKey}
        totals={summary}
        target={goal}
        size={COMPACT_MACRO_RING_PX}
        compact
        animateIn
        fillMs={DAY_LOAD_RING_FILL_MS}
        staggerMs={DAY_LOAD_RING_STAGGER_MS}
      />
    </div>
  );
}

function MealSlotSkeleton({ name }: { name: string }) {
  return (
    <section className="border-border bg-card shadow-app-1 overflow-hidden rounded-[22px] border">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-7 rounded-lg" />
          <h3 className="text-[15px] font-semibold">{name}</h3>
        </div>
        <Skeleton className="h-3.5 w-14 rounded-md" />
      </div>
      <p className="text-muted-foreground px-4 pb-3 text-[13px] font-medium">
        Nada registrado aún
      </p>
      <div className="border-border/80 flex items-center justify-center gap-1.5 border-t py-3">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-[13.5px] w-[6.25rem] rounded-md" />
      </div>
    </section>
  );
}

/**
 * Day navigation loading: rings animate first (slow), then labels + meals fade in.
 * Layout matches loaded summary card to avoid size jump on crossfade.
 */
export function TodayDayLoading({
  summary,
  goal,
  animationKey,
  mealSlots,
}: TodayDayLoadingProps) {
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setShowRest(true),
      dayLoadRingIntroDurationMs()
    );
    return () => window.clearTimeout(timer);
  }, [animationKey]);

  return (
    <div className="flex flex-col gap-3.5">
      <section className="border-border bg-card shadow-app-1 macro-summary-card overflow-hidden rounded-[22px] border">
        <div className="flex w-full items-center gap-3 px-3 py-2.5">
          {goal ? (
            <MacroRingSlot
              summary={summary}
              goal={goal}
              animationKey={animationKey}
            />
          ) : (
            <Skeleton
              className="macro-ring-slot size-[52px] shrink-0 rounded-full"
              style={{
                width: COMPACT_MACRO_RING_PX,
                height: COMPACT_MACRO_RING_PX,
              }}
            />
          )}

          <div
            className={cn(
              "min-w-0 flex-1",
              CONTENT_FADE_TRANSITION,
              showRest ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!showRest}
          >
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-[22px] w-16 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-[11px] w-[5.5rem] rounded-md" />
            </div>
            <Skeleton className="mt-2 h-1 w-full rounded-full" />
            <div className="mt-2 grid grid-cols-4 gap-1">
              <MacroChipSkeleton />
              <MacroChipSkeleton />
              <MacroChipSkeleton />
              <MacroChipSkeleton />
            </div>
          </div>

          <Skeleton
            className={cn(
              "size-5 shrink-0 rounded-sm",
              CONTENT_FADE_TRANSITION,
              showRest ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!showRest}
          />
        </div>
      </section>

      {mealSlots.length > 0 ? (
        <div
          className={cn(
            "flex flex-col gap-3.5",
            CONTENT_FADE_TRANSITION,
            showRest ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={!showRest}
        >
          <div className="flex items-baseline justify-between px-1">
            <Skeleton className="h-[11px] w-[7.25rem] rounded-sm" />
            <Skeleton className="h-3 w-[4.75rem] rounded-sm" />
          </div>
          {mealSlots.map((slot) => (
            <MealSlotSkeleton key={slot.id} name={slot.name} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
