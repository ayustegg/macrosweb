"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DayNavigator } from "@/components/features/meals/day-navigator";
import { MealSlotCard } from "@/features/meals/components/meal-slot-card";
import { DailyMacroSummary } from "@/components/features/macros/daily-macro-summary";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PullToRefresh } from "@/components/layout/pull-to-refresh";
import {
  DATE_NAV_MIN_MS,
  useHeaderBrandMotion,
} from "@/components/layout/header-brand-motion-provider";
import { cn } from "@/lib/utils";
import type { DayLogWithEntries, SlotTotals } from "@/features/meals/queries";
import type { MealSlot } from "@/features/meals/types";
import type { Entry } from "@/types/entry";

interface Goal {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  dayLog: DayLogWithEntries | null;
  goal: Goal | null;
  mealSlots: MealSlot[];
  date: string;
  timezone?: string;
}

function recalcSlotTotals(entries: Entry[]): SlotTotals {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + Number(e.kcal),
      protein_g: acc.protein_g + Number(e.protein_g),
      carbs_g: acc.carbs_g + Number(e.carbs_g),
      fat_g: acc.fat_g + Number(e.fat_g),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

function recalcDailyTotals(
  slots: Record<string, { entries: Entry[]; totals: SlotTotals }>
) {
  let kcal = 0;
  let protein_g = 0;
  let carbs_g = 0;
  let fat_g = 0;
  for (const s of Object.values(slots)) {
    kcal += s.totals.kcal;
    protein_g += s.totals.protein_g;
    carbs_g += s.totals.carbs_g;
    fat_g += s.totals.fat_g;
  }
  return {
    total_kcal: kcal,
    total_protein_g: protein_g,
    total_carbs_g: carbs_g,
    total_fat_g: fat_g,
  };
}

export function TodayPageClient({
  dayLog,
  goal,
  mealSlots,
  date,
  timezone,
}: Props) {
  const router = useRouter();
  const {
    isHomeRefreshing,
    homeRefreshStartedRef,
    completeHomeRefresh,
    pullRefreshing,
    ringPreviewProgress,
  } = useHeaderBrandMotion();
  const [optimistic, setOptimistic] = useState<{
    base: DayLogWithEntries | null;
    value: DayLogWithEntries | null;
  } | null>(null);
  const snapshotRef = useRef<DayLogWithEntries | null>(null);

  const dayLogData =
    optimistic && optimistic.base === dayLog ? optimistic.value : dayLog;

  useEffect(() => {
    if (!isHomeRefreshing) return;
    router.refresh();
  }, [isHomeRefreshing, router]);

  useEffect(() => {
    if (!isHomeRefreshing) return;

    const started = homeRefreshStartedRef.current;
    const remaining = Math.max(0, DATE_NAV_MIN_MS - (Date.now() - started));
    const minTimer = window.setTimeout(completeHomeRefresh, remaining);

    return () => window.clearTimeout(minTimer);
  }, [isHomeRefreshing, completeHomeRefresh, homeRefreshStartedRef]);

  useEffect(() => {
    if (!isHomeRefreshing) return;
    const elapsed = Date.now() - homeRefreshStartedRef.current;
    if (elapsed < DATE_NAV_MIN_MS) return;
    completeHomeRefresh();
  }, [dayLog, isHomeRefreshing, completeHomeRefresh, homeRefreshStartedRef]);

  // --- Optimistic callbacks with rollback ---

  const rollback = useCallback(() => {
    snapshotRef.current = null;
    setOptimistic(null);
  }, []);

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      snapshotRef.current = dayLogData;
      if (!dayLogData) return;
      const newSlots = { ...dayLogData.slots };
      for (const [slotId, slotData] of Object.entries(newSlots)) {
        const idx = slotData.entries.findIndex((e) => e.id === entryId);
        if (idx !== -1) {
          const newEntries = slotData.entries.filter((e) => e.id !== entryId);
          if (newEntries.length === 0) {
            delete newSlots[slotId];
          } else {
            newSlots[slotId] = {
              entries: newEntries,
              totals: recalcSlotTotals(newEntries),
            };
          }
          break;
        }
      }
      setOptimistic({
        base: dayLog,
        value: {
          ...dayLogData,
          slots: newSlots,
          ...recalcDailyTotals(newSlots),
        },
      });
    },
    [dayLog, dayLogData]
  );

  const summary = {
    kcal: dayLogData?.total_kcal ?? 0,
    protein_g: dayLogData?.total_protein_g ?? 0,
    carbs_g: dayLogData?.total_carbs_g ?? 0,
    fat_g: dayLogData?.total_fat_g ?? 0,
  };

  const hasMealSlots = mealSlots.length > 0;
  const isRefreshing = isHomeRefreshing || pullRefreshing;

  return (
    <PullToRefresh onRefresh={() => router.refresh()}>
      <div className="px-page flex flex-col gap-3.5 pt-2 pb-4">
        <DayNavigator date={date} timezone={timezone} />

        <div className="flex flex-col gap-3.5">
          <DailyMacroSummary
            summary={summary}
            goal={goal}
            pullPreviewProgress={ringPreviewProgress}
          />
          {hasMealSlots ? (
            <>
              <MealsSectionHeader />
              <div
                className={cn(
                  "flex flex-col gap-3.5 transition-opacity duration-200",
                  isRefreshing && "opacity-70"
                )}
              >
                {mealSlots.map((slot) => {
                  const slotData = dayLogData?.slots[slot.id];
                  return (
                    <MealSlotCard
                      key={slot.id}
                      slotId={slot.id}
                      slotName={slot.name}
                      slotData={
                        slotData ?? {
                          entries: [],
                          totals: {
                            kcal: 0,
                            protein_g: 0,
                            carbs_g: 0,
                            fat_g: 0,
                          },
                        }
                      }
                      date={date}
                      onDeleteEntry={handleDeleteEntry}
                      onRollback={rollback}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <FirstTimeWelcome />
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

function MealsSectionHeader() {
  return (
    <div className="flex items-baseline justify-between px-1">
      <span className="section-label">Comidas del día</span>
      <Link
        href="/profile"
        className="text-muted-foreground hover:text-foreground text-xs font-semibold"
      >
        Editar comidas
      </Link>
    </div>
  );
}

function FirstTimeWelcome() {
  return (
    <div className="flex flex-col items-center justify-center pt-4 pb-12 text-center">
      <div className="bg-muted mb-5 grid h-32 w-32 place-items-center rounded-full">
        <svg
          viewBox="0 0 64 64"
          className="text-macro-car h-16 w-16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M32 12 L35 26 L48 26 L38 34 L42 48 L32 40 L22 48 L26 34 L16 26 L29 26 Z" />
          <circle cx="32" cy="32" r="24" strokeDasharray="4 3" opacity="0.3" />
          <path d="M32 8 V4 M32 60 V56 M8 32 H4 M60 32 H56" />
        </svg>
      </div>
      <h2 className="mb-1 text-lg font-semibold">¡Bienvenido!</h2>
      <p className="text-muted-foreground mb-6 max-w-72 text-sm leading-relaxed">
        Este es tu diario de comidas. Busca alimentos, añádelos a tus momentos
        del día y sigue tus macros al instante.
      </p>
      <Link href="/foods/search">
        <Button size="lg">Empezar a registrar →</Button>
      </Link>
    </div>
  );
}
