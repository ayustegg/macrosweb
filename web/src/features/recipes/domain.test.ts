import { describe, expect, it } from "vitest";
import { computeRecipeMacros, macrosPerServing } from "./domain";
import type { Food } from "@/types/food";

const manzana: Food = {
  id: "1",
  owner_id: null,
  source: "off",
  brand: null,
  barcode: null,
  off_id: null,
  name: "Manzana",
  serving_size_g: 100,
  serving_name: null,
  density_g_per_ml: null,
  kcal: 52,
  protein_g: 0.3,
  carbs_g: 14,
  fat_g: 0.2,
  nutrients: { fiber_g: 2.4, sugars_g: 10 },
  image_url: null,
  off_last_synced_at: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const pollo: Food = {
  id: "2",
  owner_id: null,
  source: "custom",
  brand: null,
  barcode: null,
  off_id: null,
  name: "Pecho de pollo",
  serving_size_g: 100,
  serving_name: null,
  density_g_per_ml: null,
  kcal: 165,
  protein_g: 31,
  carbs_g: 0,
  fat_g: 3.6,
  nutrients: {},
  image_url: null,
  off_last_synced_at: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("computeRecipeMacros", () => {
  it("calculates total macros for recipe items", () => {
    const items = [
      { food: pollo, quantity: 200, unit: "g" as const },
      { food: manzana, quantity: 100, unit: "g" as const },
    ];
    const result = computeRecipeMacros(items);

    expect(result.kcal).toBe(330 + 52); // 382
    expect(result.protein_g).toBe(62 + 0.3); // 62.3
  });

  it("handles single item", () => {
    const items = [{ food: pollo, quantity: 200, unit: "g" as const }];
    const result = computeRecipeMacros(items);

    expect(result.kcal).toBe(330); // 200g pollo: 165 * 2
    expect(result.protein_g).toBe(62); // 31 * 2
  });

  it("handles empty items array", () => {
    const result = computeRecipeMacros([]);

    expect(result.kcal).toBe(0);
    expect(result.protein_g).toBe(0);
    expect(result.carbs_g).toBe(0);
    expect(result.fat_g).toBe(0);
  });

  it("handles multiple items", () => {
    const items = [
      { food: pollo, quantity: 500, unit: "g" as const },
      { food: manzana, quantity: 200, unit: "g" as const },
    ];
    const result = computeRecipeMacros(items);

    expect(result.kcal).toBe(825 + 104); // 929 (500g pollo + 200g manzana)
    expect(result.protein_g).toBe(155 + 0.6); // 155.6
  });

  it("rounds to 2 decimal places", () => {
    const food: Food = {
      id: "3",
      owner_id: null,
      source: "custom",
      brand: null,
      barcode: null,
      off_id: null,
      name: "Test food",
      serving_size_g: 100,
      serving_name: null,
      density_g_per_ml: null,
      kcal: 123,
      protein_g: 33,
      carbs_g: 0,
      fat_g: 0,
      nutrients: {},
      image_url: null,
      off_last_synced_at: null,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };
    const items = [{ food, quantity: 17, unit: "g" as const }];
    const result = computeRecipeMacros(items);

    expect(result.kcal).toBe(20.91);
    expect(result.protein_g).toBe(5.61);
  });
});

describe("macrosPerServing", () => {
  it("divides totals by servings", () => {
    const result = macrosPerServing(
      { kcal: 300, protein_g: 60, carbs_g: 30, fat_g: 10 },
      3
    );

    expect(result.kcal).toBe(100);
    expect(result.protein_g).toBe(20);
    expect(result.carbs_g).toBe(10);
    expect(result.fat_g).toBeCloseTo(3.33, 2);
  });

  it("handles 1 serving", () => {
    const result = macrosPerServing(
      { kcal: 150, protein_g: 30, carbs_g: 10, fat_g: 5 },
      1
    );

    expect(result.kcal).toBe(150);
    expect(result.protein_g).toBe(30);
  });

  it("rounds to 2 decimal places", () => {
    const result = macrosPerServing(
      { kcal: 100, protein_g: 33, carbs_g: 0, fat_g: 0 },
      3
    );

    expect(result.kcal).toBeCloseTo(33.33, 2);
    expect(result.protein_g).toBe(11);
  });

  it("throws for zero or negative servings", () => {
    expect(() =>
      macrosPerServing({ kcal: 100, protein_g: 20, carbs_g: 10, fat_g: 5 }, 0)
    ).toThrow("Las porciones deben ser mayores a 0");
  });
});
