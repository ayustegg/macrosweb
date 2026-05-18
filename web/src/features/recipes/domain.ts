import { convertToGrams } from "@/lib/nutrition/units";
import type { Food } from "@/types/food";
import type { RecipeMacros } from "./types";

export interface RecipeItemWithFood {
  food: Food;
  quantity: number;
  unit: string;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeRecipeMacros(items: RecipeItemWithFood[]): RecipeMacros {
  let kcal = 0;
  let protein_g = 0;
  let carbs_g = 0;
  let fat_g = 0;

  for (const item of items) {
    const grams = convertToGrams(
      item.quantity,
      item.unit as "g" | "ml" | "serving",
      {
        serving_size_g: item.food.serving_size_g,
        density_g_per_ml: item.food.density_g_per_ml,
      }
    );
    const factor = grams / 100;
    kcal += item.food.kcal * factor;
    protein_g += item.food.protein_g * factor;
    carbs_g += item.food.carbs_g * factor;
    fat_g += item.food.fat_g * factor;
  }

  return {
    kcal: round(kcal),
    protein_g: round(protein_g),
    carbs_g: round(carbs_g),
    fat_g: round(fat_g),
  };
}

export function macrosPerServing(
  totalMacros: RecipeMacros,
  servings: number
): RecipeMacros {
  if (servings <= 0) {
    throw new Error("Las porciones deben ser mayores a 0");
  }
  return {
    kcal: round(totalMacros.kcal / servings),
    protein_g: round(totalMacros.protein_g / servings),
    carbs_g: round(totalMacros.carbs_g / servings),
    fat_g: round(totalMacros.fat_g / servings),
  };
}
