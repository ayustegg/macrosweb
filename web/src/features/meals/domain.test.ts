import { describe, expect, it } from "vitest";
import { computeEntrySnapshot, type FoodSnapshotSource } from "./domain";

const manzana: FoodSnapshotSource = {
  kcal: 52,
  protein_g: 0.3,
  carbs_g: 14,
  fat_g: 0.2,
  nutrients: { fiber_g: 2.4, sugars_g: 10 },
  serving_size_g: 100,
  density_g_per_ml: null,
};

const aceite: FoodSnapshotSource = {
  kcal: 884,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 100,
  nutrients: {},
  serving_size_g: 100,
  density_g_per_ml: 0.92,
};

describe("computeEntrySnapshot", () => {
  it("scales macros for 200g of food", () => {
    const result = computeEntrySnapshot(manzana, 200, "g");
    expect(result.kcal).toBe(104);
    expect(result.protein_g).toBe(0.6);
    expect(result.carbs_g).toBe(28);
    expect(result.fat_g).toBe(0.4);
  });

  it("scales macros for 50g of food", () => {
    const result = computeEntrySnapshot(manzana, 50, "g");
    expect(result.kcal).toBe(26);
    expect(result.protein_g).toBe(0.15);
    expect(result.carbs_g).toBe(7);
    expect(result.fat_g).toBe(0.1);
  });

  it("converts ml using density", () => {
    const result = computeEntrySnapshot(aceite, 50, "ml");
    const grams = 50 * 0.92;
    const factor = grams / 100;
    expect(result.kcal).toBe(Math.round(884 * factor * 100) / 100);
    expect(result.fat_g).toBe(Math.round(100 * factor * 100) / 100);
  });

  it("converts servings using serving_size_g", () => {
    const result = computeEntrySnapshot(manzana, 2, "serving");
    const grams = 2 * 100;
    const factor = grams / 100;
    expect(result.kcal).toBe(Math.round(52 * factor * 100) / 100);
  });

  it("scales nutrients along with macros", () => {
    const result = computeEntrySnapshot(manzana, 150, "g");
    expect(result.nutrients.fiber_g).toBe(3.6);
    expect(result.nutrients.sugars_g).toBe(15);
  });

  it("handles 100g (1x factor) correctly", () => {
    const result = computeEntrySnapshot(manzana, 100, "g");
    expect(result.kcal).toBe(52);
    expect(result.protein_g).toBe(0.3);
    expect(result.carbs_g).toBe(14);
    expect(result.fat_g).toBe(0.2);
    expect(result.nutrients.fiber_g).toBe(2.4);
  });

  it("rounds to 2 decimal places", () => {
    const food: FoodSnapshotSource = {
      kcal: 123,
      protein_g: 33,
      carbs_g: 0,
      fat_g: 0,
      nutrients: {},
      serving_size_g: 100,
      density_g_per_ml: null,
    };
    const result = computeEntrySnapshot(food, 17, "g");
    expect(result.kcal).toBe(20.91);
    expect(result.protein_g).toBe(5.61);
  });

  it("handles zero macros gracefully", () => {
    const result = computeEntrySnapshot(aceite, 100, "g");
    expect(result.kcal).toBe(884);
    expect(result.protein_g).toBe(0);
    expect(result.carbs_g).toBe(0);
    expect(result.fat_g).toBe(100);
  });

  it("throws for invalid units without density", () => {
    expect(() => computeEntrySnapshot(manzana, 100, "ml")).toThrow(
      "food has no density value"
    );
  });

  it("throws for zero quantity", () => {
    expect(() => computeEntrySnapshot(manzana, 0, "g")).toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("converts 1 serving for food with custom serving_size", () => {
    const customFood: FoodSnapshotSource = {
      kcal: 150,
      protein_g: 5,
      carbs_g: 30,
      fat_g: 1,
      nutrients: {},
      serving_size_g: 50,
      density_g_per_ml: null,
    };
    const result = computeEntrySnapshot(customFood, 1, "serving");
    expect(result.kcal).toBe(75);
    expect(result.protein_g).toBe(2.5);
    expect(result.carbs_g).toBe(15);
    expect(result.fat_g).toBe(0.5);
  });
});
