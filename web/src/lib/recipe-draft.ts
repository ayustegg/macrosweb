import type { Food } from "@/types/food";

const STORAGE_KEY = "macrosweb:recipe-pending-ingredient";

export interface PendingIngredient {
  food: Food;
  quantity: number;
  unit: "g" | "ml" | "serving";
}

export function pushPendingIngredient(ingredient: PendingIngredient): void {
  if (typeof window === "undefined") return;
  const existing = consumePendingIngredients();
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...existing, ingredient])
  );
}

export function consumePendingIngredients(): PendingIngredient[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingIngredient[];
  } catch {
    return [];
  }
}
