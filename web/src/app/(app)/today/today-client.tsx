"use client";

import { useEffect, useState } from "react";
import { DayNavigator } from "@/features/meals/components/day-navigator";
import { MealSlotCard } from "@/features/meals/components/meal-slot-card";
import { DailyMacroSummary } from "@/components/features/macros/daily-macro-summary";
import type { DayLogWithEntries } from "@/features/meals/queries";
import type { MealSlot } from "@/features/meals/types";

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
}

interface FetchResponse {
  slots: MealSlot[];
}

export function TodayPageClient({ dayLog, goal, date }: Props) {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/meal-slots");
        if (!res.ok) throw new Error("Error al cargar horarios");
        const json: FetchResponse = await res.json();
        setSlots(json.slots);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const summary = {
    kcal: dayLog?.total_kcal ?? 0,
    protein_g: dayLog?.total_protein_g ?? 0,
    carbs_g: dayLog?.total_carbs_g ?? 0,
    fat_g: dayLog?.total_fat_g ?? 0,
  };

  const hasEntries = dayLog && Object.keys(dayLog.slots).length > 0;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-24">
      {/* Day navigator */}
      <DayNavigator date={date} />

      {/* Macro summary */}
      <DailyMacroSummary summary={summary} goal={goal} />

      {/* Slot cards or empty state */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : hasEntries ? (
        <div className="space-y-3">
          {slots.map((slot) => {
            const slotData = dayLog?.slots[slot.id];
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
