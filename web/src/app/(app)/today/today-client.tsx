"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DayNavigator } from "@/components/features/meals/day-navigator";
import { MealSlotCard } from "@/features/meals/components/meal-slot-card";
import { DailyMacroSummary } from "@/components/features/macros/daily-macro-summary";
import { Button } from "@/components/ui/button";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
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
  date: string;
  timezone?: string;
  hasAnyEntry?: boolean;
}

interface FetchResponse {
  slots: MealSlot[];
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

async function fetchSlots(): Promise<MealSlot[]> {
  const res = await fetch("/api/meal-slots");
  if (!res.ok) return [];
  const json: FetchResponse = await res.json();
  return json.slots;
}

function useSlots(): MealSlot[] {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const initiated = useRef(false);
  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;
    fetchSlots()
      .then(setSlots)
      .catch(() => setSlots([]));
  }, []);
  return slots;
}

export function TodayPageClient({
  dayLog,
  goal,
  date,
  timezone,
  hasAnyEntry = false,
}: Props) {
  const router = useRouter();
  const [dayLogData, setDayLogData] = useState(() => dayLog);
  const snapshotRef = useRef<DayLogWithEntries | null>(null);
  const slots = useSlots();
  const {
    refreshing,
    pulling,
    handlers: pullHandlers,
  } = usePullToRefresh(() => router.refresh());

  // --- Optimistic callbacks with rollback ---

  const rollback = useCallback(() => {
    if (snapshotRef.current) {
      setDayLogData(snapshotRef.current);
      snapshotRef.current = null;
    }
  }, []);

  const saveSnapshot = useCallback(() => {
    snapshotRef.current = dayLogData;
  }, [dayLogData]);

  const handleUpdateEntry = useCallback(
    (entry: Entry) => {
      saveSnapshot();
      setDayLogData((prev) => {
        if (!prev) return prev;
        const newSlots = { ...prev.slots };
        for (const [slotId, slotData] of Object.entries(newSlots)) {
          const idx = slotData.entries.findIndex((e) => e.id === entry.id);
          if (idx !== -1) {
            const newEntries = [...slotData.entries];
            newEntries[idx] = entry;
            newSlots[slotId] = {
              entries: newEntries,
              totals: recalcSlotTotals(newEntries),
            };
            break;
          }
        }
        return { ...prev, slots: newSlots, ...recalcDailyTotals(newSlots) };
      });
    },
    [saveSnapshot]
  );

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      saveSnapshot();
      setDayLogData((prev) => {
        if (!prev) return prev;
        const newSlots = { ...prev.slots };
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
        return {
          ...prev,
          slots: newSlots,
          ...recalcDailyTotals(newSlots),
        };
      });
    },
    [saveSnapshot]
  );

  const handleMoveEntry = useCallback(
    (entryId: string, newSlotId: string) => {
      saveSnapshot();
      setDayLogData((prev) => {
        if (!prev) return prev;
        let movedEntry: Entry | undefined;
        const newSlots = { ...prev.slots };

        // Remove from source slot
        for (const [slotId, slotData] of Object.entries(newSlots)) {
          const idx = slotData.entries.findIndex((e) => e.id === entryId);
          if (idx !== -1) {
            movedEntry = slotData.entries[idx];
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

        // Add to target slot
        if (movedEntry) {
          const updated = { ...movedEntry, meal_slot_id: newSlotId };
          const target = newSlots[newSlotId];
          if (target) {
            newSlots[newSlotId] = {
              entries: [...target.entries, updated],
              totals: recalcSlotTotals([...target.entries, updated]),
            };
          } else {
            newSlots[newSlotId] = {
              entries: [updated],
              totals: recalcSlotTotals([updated]),
            };
          }
        }

        return {
          ...prev,
          slots: newSlots,
          ...recalcDailyTotals(newSlots),
        };
      });
    },
    [saveSnapshot]
  );

  const summary = {
    kcal: dayLogData?.total_kcal ?? 0,
    protein_g: dayLogData?.total_protein_g ?? 0,
    carbs_g: dayLogData?.total_carbs_g ?? 0,
    fat_g: dayLogData?.total_fat_g ?? 0,
  };

  const hasEntries = dayLogData && Object.keys(dayLogData.slots).length > 0;

  return (
    <div
      className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-24"
      {...pullHandlers}
    >
      {(pulling || refreshing) && (
        <div className="text-muted-foreground flex justify-center py-2 text-xs">
          {refreshing ? "Actualizando..." : "Suelta para actualizar"}
        </div>
      )}
      <DayNavigator date={date} timezone={timezone} />
      <DailyMacroSummary summary={summary} goal={goal} />

      {hasEntries ? (
        <div className="space-y-3">
          {slots.map((slot) => {
            const slotData = dayLogData?.slots[slot.id];
            return (
              <MealSlotCard
                key={slot.id}
                slotId={slot.id}
                slotName={slot.name}
                slotData={
                  slotData ?? {
                    entries: [],
                    totals: { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
                  }
                }
                allSlots={slots}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
                onMoveEntry={handleMoveEntry}
                onRollback={rollback}
              />
            );
          })}
        </div>
      ) : hasAnyEntry ? (
        <EmptyDay />
      ) : (
        <FirstTimeWelcome />
      )}
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center justify-center px-4 pt-8 pb-16 text-center">
      <svg
        viewBox="0 0 120 120"
        className="mb-5 h-32 w-32 text-zinc-300 dark:text-zinc-600"
        fill="none"
      >
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <path
          d="M72 72 Q84 60 72 48"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M48 72 Q36 60 48 48"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M42 42 L36 36 M78 42 L84 36 M60 36 V28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <h2 className="mb-1 text-lg font-semibold">Sin registros hoy</h2>
      <p className="text-muted-foreground mb-6 max-w-64 text-sm">
        Aún no has añadido nada. Busca un alimento para empezar a registrar tu
        día.
      </p>
      <Link href="/foods/search">
        <Button size="lg">Empezar a registrar →</Button>
      </Link>
    </div>
  );
}

function FirstTimeWelcome() {
  return (
    <div className="flex flex-col items-center justify-center px-4 pt-8 pb-16 text-center">
      <svg
        viewBox="0 0 120 120"
        className="mb-5 h-32 w-32 text-amber-400"
        fill="none"
      >
        <path
          d="M60 20 L64 44 L88 44 L68 58 L76 82 L60 66 L44 82 L52 58 L32 44 L56 44 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle
          cx="60"
          cy="60"
          r="36"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.3"
          strokeDasharray="4 3"
        />
        <path
          d="M60 24 V18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M60 102 V96"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 60 H18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M102 60 H96"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
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
