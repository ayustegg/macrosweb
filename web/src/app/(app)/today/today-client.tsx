"use client";

import { useEffect, useState } from "react";
import { MealSlotCard } from "@/features/meals/components/meal-slot-card";
import type { DayLogWithEntries } from "@/features/meals/queries";
import type { MealSlot } from "@/features/meals/types";

interface Props {
  dayLog: DayLogWithEntries | null;
  date: string;
}

interface FetchResponse {
  slots: MealSlot[];
}

export function TodayPageClient({ dayLog }: Props) {
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

  const dailyTotals = dayLog
    ? Object.values(dayLog.slots).reduce(
        (acc, s) => ({
          kcal: acc.kcal + s.totals.kcal,
          protein_grams: acc.protein_grams + s.totals.protein_g,
          carbs_grams: acc.carbs_grams + s.totals.carbs_g,
          fat_grams: acc.fat_grams + s.totals.fat_g,
        }),
        { kcal: 0, protein_grams: 0, carbs_grams: 0, fat_grams: 0 }
      )
    : null;

  const hasEntries = dayLog && Object.keys(dayLog.slots).length > 0;

  if (!hasEntries) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <span className="text-2xl">🍽️</span>
        </div>
        <h2 className="mb-1 text-lg font-semibold">Sin registros hoy</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Añade tu primera comida del día para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
      {/* Daily totals bar */}
      <div className="bg-card rounded-xl border px-4 py-3 shadow-sm">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Total
          </span>
          <span className="text-xl font-bold tabular-nums">
            {Math.round(dailyTotals!.kcal)}
          </span>
        </div>
        <div className="text-muted-foreground flex gap-4 text-xs">
          <span className="tabular-nums">
            P {Math.round(dailyTotals!.protein_grams)}g
          </span>
          <span className="tabular-nums">
            C {Math.round(dailyTotals!.carbs_grams)}g
          </span>
          <span className="tabular-nums">
            G {Math.round(dailyTotals!.fat_grams)}g
          </span>
        </div>
      </div>

      {/* Slot cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot: MealSlot) => {
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
      )}
    </div>
  );
}
