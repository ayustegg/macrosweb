import type { EntryUnit, FoodPortion } from "./types";

export function convertToGrams(
  quantity: number,
  unit: EntryUnit,
  food: FoodPortion
): number {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  switch (unit) {
    case "g":
      return quantity;
    case "ml": {
      if (food.density_g_per_ml == null) {
        throw new Error("Cannot convert ml to g: food has no density value");
      }
      return quantity * food.density_g_per_ml;
    }
    case "serving": {
      if (food.serving_size_g <= 0) {
        throw new Error(
          "Cannot convert serving to g: food has no serving size"
        );
      }
      return quantity * food.serving_size_g;
    }
  }
}
