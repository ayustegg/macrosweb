import type { Food } from "@/types/food";

interface OffNutriments {
  "energy-kcal_100g"?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  "saturated-fat_100g"?: number;
  "trans-fat_100g"?: number;
  "monounsaturated-fat_100g"?: number;
  "polyunsaturated-fat_100g"?: number;
  cholesterol_100g?: number;
  sodium_100g?: number;
  salt_100g?: number;
  potassium_100g?: number;
  calcium_100g?: number;
  iron_100g?: number;
  "vitamin-a_100g"?: number;
  "vitamin-c_100g"?: number;
}

export interface OffProduct {
  code: string;
  product_name?: string;
  brands?: string | null;
  image_url?: string | null;
  nutriments: OffNutriments;
  serving_size?: string | null;
}

export interface OffSearchResponse {
  count: number;
  products: OffProduct[];
}

export interface OffProductResponse {
  code: string;
  product: OffProduct | null;
  status: number;
}

function parseServingSize(servingSize?: string | null): {
  serving_size_g: number;
  serving_name: string | null;
} {
  if (!servingSize) return { serving_size_g: 100, serving_name: null };

  const match = servingSize.match(
    /^([\d.,]+)\s*(g|ml|kilogramo|litro|kg|l|pieza|taza|unidad|porción)?(?:\s*\(([\d.,]+\s*g)\))?$/i
  );

  if (match) {
    const unit = (match[2] ?? "g").toLowerCase();

    // "1 pieza (150 g)" → prefer parenthesized grams
    if (match[3]) {
      const grams = parseFloat(match[3]);
      return { serving_size_g: grams, serving_name: null };
    }

    const value = parseFloat(match[1].replace(",", "."));

    if (unit === "kg" || unit === "kilogramo") {
      return { serving_size_g: value * 1000, serving_name: null };
    }
    if (unit === "l" || unit === "litro") {
      return { serving_size_g: value * 1000, serving_name: null };
    }
    return { serving_size_g: value, serving_name: null };
  }

  return { serving_size_g: 100, serving_name: null };
}

function safeFloat(value: number | undefined | null): number {
  if (value == null || isNaN(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function mapOffProductToFood(off: OffProduct): Food {
  const nutriments = off.nutriments ?? {};
  const { serving_size_g, serving_name } = parseServingSize(off.serving_size);

  const kcal =
    safeFloat(nutriments["energy-kcal_100g"]) ||
    Math.round(safeFloat(nutriments.energy_100g) / 4.184);

  const nutrients: Record<string, number> = {};
  const fiber = safeFloat(nutriments.fiber_100g);
  if (fiber) nutrients.fiber_g = fiber;
  const sugars = safeFloat(nutriments.sugars_100g);
  if (sugars) nutrients.sugars_g = sugars;
  const satFat = safeFloat(nutriments["saturated-fat_100g"]);
  if (satFat) nutrients.saturated_fat_g = satFat;
  const transFat = safeFloat(nutriments["trans-fat_100g"]);
  if (transFat) nutrients.trans_fat_g = transFat;
  const monoFat = safeFloat(nutriments["monounsaturated-fat_100g"]);
  if (monoFat) nutrients.monounsaturated_fat_g = monoFat;
  const polyFat = safeFloat(nutriments["polyunsaturated-fat_100g"]);
  if (polyFat) nutrients.polyunsaturated_fat_g = polyFat;
  const cholesterol = safeFloat(nutriments.cholesterol_100g);
  if (cholesterol) nutrients.cholesterol_mg = cholesterol;
  const sodium = safeFloat(nutriments.sodium_100g);
  if (sodium) nutrients.sodium_mg = sodium;
  const salt = safeFloat(nutriments.salt_100g);
  if (salt) nutrients.salt_g = salt;
  const potassium = safeFloat(nutriments.potassium_100g);
  if (potassium) nutrients.potassium_mg = potassium;
  const calcium = safeFloat(nutriments.calcium_100g);
  if (calcium) nutrients.calcium_mg = calcium;
  const iron = safeFloat(nutriments.iron_100g);
  if (iron) nutrients.iron_mg = iron;
  const vita = safeFloat(nutriments["vitamin-a_100g"]);
  if (vita) nutrients.vitamin_a_mcg = vita;
  const vitc = safeFloat(nutriments["vitamin-c_100g"]);
  if (vitc) nutrients.vitamin_c_mg = vitc;

  return {
    id: off.code,
    owner_id: null,
    source: "off",
    brand: off.brands ?? null,
    barcode: off.code,
    off_id: off.code,
    name: off.product_name ?? "Producto sin nombre",
    serving_size_g,
    serving_name: serving_name ?? off.serving_size ?? null,
    density_g_per_ml: null,
    kcal,
    protein_g: safeFloat(nutriments.proteins_100g),
    carbs_g: safeFloat(nutriments.carbohydrates_100g),
    fat_g: safeFloat(nutriments.fat_100g),
    nutrients,
    image_url: off.image_url ?? null,
    off_last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
