import { describe, expect, it } from "vitest";
import { aggregateMacros } from "./aggregate";
import type { NutritionEntry } from "./types";

describe("aggregateMacros", () => {
  it("sums macros from multiple entries", () => {
    const entries: NutritionEntry[] = [
      {
        quantity: 100,
        unit: "g",
        kcal: 250,
        protein_g: 10,
        carbs_g: 30,
        fat_g: 12,
        nutrients: { fiber_g: 3, sodium_mg: 200 },
      },
      {
        quantity: 200,
        unit: "ml",
        kcal: 120,
        protein_g: 2,
        carbs_g: 15,
        fat_g: 5,
        nutrients: { fiber_g: 0, sodium_mg: 100 },
      },
    ];

    const result = aggregateMacros(entries);

    expect(result.kcal).toBe(370);
    expect(result.protein_g).toBe(12);
    expect(result.carbs_g).toBe(45);
    expect(result.fat_g).toBe(17);
    expect(result.nutrients.fiber_g).toBe(3);
    expect(result.nutrients.sodium_mg).toBe(300);
  });

  it("returns zeros for empty entries", () => {
    const result = aggregateMacros([]);

    expect(result.kcal).toBe(0);
    expect(result.protein_g).toBe(0);
    expect(result.carbs_g).toBe(0);
    expect(result.fat_g).toBe(0);
    expect(result.nutrients).toEqual({});
  });

  it("aggregates a single entry", () => {
    const entries: NutritionEntry[] = [
      {
        quantity: 1,
        unit: "serving",
        kcal: 500,
        protein_g: 30,
        carbs_g: 40,
        fat_g: 20,
        nutrients: { fiber_g: 5 },
      },
    ];

    const result = aggregateMacros(entries);

    expect(result.kcal).toBe(500);
    expect(result.protein_g).toBe(30);
    expect(result.nutrients.fiber_g).toBe(5);
  });

  it("handles entries with no nutrients", () => {
    const entries: NutritionEntry[] = [
      {
        quantity: 100,
        unit: "g",
        kcal: 100,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        nutrients: {},
      },
    ];

    const result = aggregateMacros(entries);

    expect(result.kcal).toBe(100);
    expect(result.nutrients).toEqual({});
  });

  it("handles entries with different nutrient keys", () => {
    const entries: NutritionEntry[] = [
      {
        quantity: 100,
        unit: "g",
        kcal: 100,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        nutrients: { fiber_g: 1, vitamin_c_mg: 50 },
      },
      {
        quantity: 100,
        unit: "g",
        kcal: 100,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        nutrients: { fiber_g: 2, calcium_mg: 200 },
      },
    ];

    const result = aggregateMacros(entries);

    expect(result.nutrients.fiber_g).toBe(3);
    expect(result.nutrients.vitamin_c_mg).toBe(50);
    expect(result.nutrients.calcium_mg).toBe(200);
  });
});
