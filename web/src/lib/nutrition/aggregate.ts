import type { MacroTotals, NutritionEntry } from "./types";

export function aggregateMacros(entries: NutritionEntry[]): MacroTotals {
  const totals: MacroTotals = {
    kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    nutrients: {},
  };

  for (const entry of entries) {
    totals.kcal += entry.kcal;
    totals.protein_g += entry.protein_g;
    totals.carbs_g += entry.carbs_g;
    totals.fat_g += entry.fat_g;

    for (const [key, value] of Object.entries(entry.nutrients)) {
      if (typeof value === "number") {
        totals.nutrients[key] = (totals.nutrients[key] ?? 0) + value;
      }
    }
  }

  return totals;
}
