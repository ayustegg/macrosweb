import { describe, expect, it } from "vitest";
import { convertToGrams } from "./units";
import type { FoodPortion } from "./types";

describe("convertToGrams", () => {
  const food: FoodPortion = {
    serving_size_g: 200,
    density_g_per_ml: 1.03,
  };

  it("converts grams directly", () => {
    expect(convertToGrams(100, "g", food)).toBe(100);
  });

  it("converts ml using density", () => {
    expect(convertToGrams(250, "ml", food)).toBeCloseTo(257.5);
  });

  it("converts servings using serving_size_g", () => {
    expect(convertToGrams(2, "serving", food)).toBe(400);
  });

  it("handles fractional servings", () => {
    expect(convertToGrams(0.5, "serving", food)).toBe(100);
  });

  it("throws when converting ml without density", () => {
    const noDensityFood: FoodPortion = {
      serving_size_g: 200,
      density_g_per_ml: null,
    };
    expect(() => convertToGrams(100, "ml", noDensityFood)).toThrow(
      "food has no density value"
    );
  });

  it("throws when converting serving without serving_size_g", () => {
    const noServingFood: FoodPortion = {
      serving_size_g: 0,
      density_g_per_ml: null,
    };
    expect(() => convertToGrams(1, "serving", noServingFood)).toThrow(
      "food has no serving size"
    );
  });

  it("throws when quantity is zero", () => {
    expect(() => convertToGrams(0, "g", food)).toThrow(
      "Quantity must be greater than 0"
    );
  });

  it("throws when quantity is negative", () => {
    expect(() => convertToGrams(-10, "g", food)).toThrow(
      "Quantity must be greater than 0"
    );
  });
});
