export type Sex = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type GoalType = "lose" | "maintain" | "gain";

export type EntryUnit = "g" | "ml" | "serving";

export interface NutritionProfile {
  sex: Sex;
  weight_kg: number;
  height_cm: number;
  age: number;
  activity_level: ActivityLevel;
}

export interface FoodPortion {
  serving_size_g: number;
  density_g_per_ml: number | null;
}

export interface NutritionEntry {
  quantity: number;
  unit: EntryUnit;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  nutrients: Record<string, number>;
}

export interface MacroTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  nutrients: Record<string, number>;
}

export interface SuggestedMacros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
