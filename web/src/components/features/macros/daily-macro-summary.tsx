"use client";

import Link from "next/link";
import { MacroRing } from "@/components/features/macros/macro-ring";

interface Summary {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Goal {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  summary: Summary;
  goal: Goal | null;
}

const COLORS = {
  kcal: "#f43f5e",
  protein: "#3b82f6",
  carbs: "#f59e0b",
  fat: "#a855f7",
} as const;

export function DailyMacroSummary({ summary, goal }: Props) {
  if (!goal) {
    return (
      <div className="bg-card rounded-xl border px-4 py-6 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">
          <Link
            href="/profile"
            className="text-foreground hover:text-primary font-medium underline underline-offset-2"
          >
            Configura tu objetivo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border px-4 py-6 shadow-sm">
      {/* Kcal ring — large, centered */}
      <div className="flex justify-center">
        <MacroRing
          value={summary.kcal}
          target={goal.kcal}
          color={COLORS.kcal}
          label="Calorías"
          unit="kcal"
          size={160}
        />
      </div>

      {/* P/C/G rings — row below */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1">
          <MacroRing
            value={summary.protein_g}
            target={goal.protein_g}
            color={COLORS.protein}
            label="Proteína"
            unit="g"
            size={100}
          />
          <span className="text-muted-foreground text-xs">Proteína</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <MacroRing
            value={summary.carbs_g}
            target={goal.carbs_g}
            color={COLORS.carbs}
            label="Carbohidratos"
            unit="g"
            size={100}
          />
          <span className="text-muted-foreground text-xs">Carbohidratos</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <MacroRing
            value={summary.fat_g}
            target={goal.fat_g}
            color={COLORS.fat}
            label="Grasa"
            unit="g"
            size={100}
          />
          <span className="text-muted-foreground text-xs">Grasa</span>
        </div>
      </div>
    </div>
  );
}
