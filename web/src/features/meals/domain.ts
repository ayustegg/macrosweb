import { convertToGrams } from "@/lib/nutrition/units";
import type { EntryUnit } from "@/lib/nutrition/types";

export interface FoodSnapshotSource {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  nutrients: Record<string, number>;
  serving_size_g: number;
  density_g_per_ml: number | null;
}

export interface EntrySnapshot {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  nutrients: Record<string, number>;
}

type NutritionProfile = Record<string, unknown>;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeEntrySnapshot(
  food: FoodSnapshotSource,
  quantity: number,
  unit: EntryUnit,
  _profile?: NutritionProfile
): EntrySnapshot {
  const grams = convertToGrams(quantity, unit, {
    serving_size_g: food.serving_size_g,
    density_g_per_ml: food.density_g_per_ml,
  });

  const factor = grams / 100;

  const nutrients: Record<string, number> = {};
  for (const [key, value] of Object.entries(food.nutrients)) {
    if (typeof value === "number") {
      nutrients[key] = round(value * factor);
    }
  }

  return {
    kcal: round(food.kcal * factor),
    protein_g: round(food.protein_g * factor),
    carbs_g: round(food.carbs_g * factor),
    fat_g: round(food.fat_g * factor),
    nutrients,
  };
}
