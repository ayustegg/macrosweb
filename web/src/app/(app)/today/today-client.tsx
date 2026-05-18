"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DayNavigator } from "@/components/features/meals/day-navigator";
import { MealSlotCard } from "@/features/meals/components/meal-slot-card";
import { DailyMacroSummary } from "@/components/features/macros/daily-macro-summary";
import Link from "next/link";
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
      className="w-full"
      {...pullHandlers}
    >
      {(pulling || refreshing) && (
        <div className="text-muted-foreground flex justify-center py-2 text-xs">
          {refreshing ? "Actualizando..." : "Suelta para actualizar"}
        </div>
      )}

      <div className="space-y-3.5 px-page pt-2">
        <DayNavigator date={date} timezone={timezone} />
        <DailyMacroSummary summary={summary} goal={goal} />
        <div className="flex items-baseline justify-between px-1 pt-1">
          <span className="section-label">Comidas del día</span>
          <Link
            href="/profile"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Editar comidas
          </Link>
        </div>
      </div>

      {hasEntries ? (
        <div className="px-page">
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
                date={date}
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
        <EmptyDay date={date} />
      ) : (
        <FirstTimeWelcome />
      )}
    </div>
  );
}

function EmptyDay({ date }: { date: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-page pt-8 pb-16 text-center">
      <div className="mb-5 grid h-32 w-32 place-items-center rounded-full bg-muted">
        <svg
          viewBox="0 0 64 64"
          className="h-16 w-16 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="32" cy="32" r="24" strokeDasharray="4 3" />
          <path d="M38 38 Q44 32 38 26" />
          <path d="M26 38 Q20 32 26 26" />
          <path d="M22 22 L19 19 M42 22 L45 19 M32 20 V15" />
        </svg>
      </div>
      <h2 className="mb-1 text-lg font-semibold">Sin registros hoy</h2>
      <p className="text-muted-foreground mb-6 max-w-64 text-sm">
        Aún no has añadido nada. Busca un alimento para empezar a registrar tu
        día.
      </p>
      <Link href={`/foods/search?date=${date}`}>
        <Button size="lg">Empezar a registrar →</Button>
      </Link>
    </div>
  );
}

function FirstTimeWelcome() {
  return (
    <div className="flex flex-col items-center justify-center px-page pt-8 pb-16 text-center">
      <div className="mb-5 grid h-32 w-32 place-items-center rounded-full bg-muted">
        <svg
          viewBox="0 0 64 64"
          className="h-16 w-16 text-macro-car"
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
