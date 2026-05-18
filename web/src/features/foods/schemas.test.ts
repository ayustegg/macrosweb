import { describe, expect, it } from "vitest";
import { createFoodSchema, updateFoodSchema } from "./schemas";

describe("createFoodSchema", () => {
  it("accepts valid food data", () => {
    const result = createFoodSchema.safeParse({
      name: "Manzana",
      source: "off",
      kcal: 52,
      protein_g: 0.3,
      carbs_g: 14,
      fat_g: 0.2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createFoodSchema.safeParse({
      source: "off",
      kcal: 52,
      protein_g: 0.3,
      carbs_g: 14,
      fat_g: 0.2,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects negative calories", () => {
    const result = createFoodSchema.safeParse({
      name: "Test",
      source: "custom",
      kcal: -10,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("kcal");
    }
  });

  it("defaults serving_size_g to 100", () => {
    const result = createFoodSchema.safeParse({
      name: "Test",
      source: "off",
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.serving_size_g).toBe(100);
    }
  });

  it("accepts optional barcode and serving_name", () => {
    const result = createFoodSchema.safeParse({
      name: "Leche",
      source: "off",
      barcode: "841234567890",
      serving_name: "vaso",
      kcal: 42,
      protein_g: 3.4,
      carbs_g: 5,
      fat_g: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero serving_size_g", () => {
    const result = createFoodSchema.safeParse({
      name: "Test",
      source: "off",
      serving_size_g: 0,
      kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative protein", () => {
    const result = createFoodSchema.safeParse({
      name: "Test",
      source: "off",
      kcal: 100,
      protein_g: -1,
      carbs_g: 0,
      fat_g: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts density_g_per_ml", () => {
    const result = createFoodSchema.safeParse({
      name: "Aceite",
      source: "custom",
      density_g_per_ml: 0.92,
      kcal: 884,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 100,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateFoodSchema", () => {
  it("accepts partial update", () => {
    const result = updateFoodSchema.safeParse({ name: "Nuevo nombre" });
    expect(result.success).toBe(true);
  });

  it("accepts empty update", () => {
    const result = updateFoodSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects negative carbs", () => {
    const result = updateFoodSchema.safeParse({ carbs_g: -5 });
    expect(result.success).toBe(false);
  });
});
