"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { DayNavigator } from "@/components/features/meals/day-navigator";
import { MealSlotCard } from "@/features/meals/components/meal-slot-card";
import { DailyMacroSummary } from "@/components/features/macros/daily-macro-summary";
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

export function TodayPageClient({ dayLog, goal, date, timezone }: Props) {
  const [dayLogData, setDayLogData] = useState(() => dayLog);
  const snapshotRef = useRef<DayLogWithEntries | null>(null);
  const slots = useSlots();

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
    <div className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-24">
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
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <h2 className="mb-1 text-lg font-semibold">Sin registros</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Añade tu primera comida del día para empezar.
          </p>
        </div>
      )}
    </div>
  );
}
