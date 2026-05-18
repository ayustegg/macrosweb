import { describe, expect, it } from "vitest";
import { createEntrySchema, updateEntrySchema } from "./schemas";

const validEntry = {
  day_log_id: "123e4567-e89b-12d3-a456-426614174000",
  source_type: "food" as const,
  source_name: "Manzana",
  quantity: 200,
  unit: "g" as const,
  kcal: 104,
  protein_g: 0.6,
  carbs_g: 28,
  fat_g: 0.4,
};

describe("createEntrySchema", () => {
  it("accepts valid entry", () => {
    const result = createEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("rejects missing day_log_id", () => {
    const { day_log_id, ...rest } = validEntry;
    const result = createEntrySchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("day_log_id");
    }
  });

  it("rejects invalid day_log_id", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      day_log_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid unit", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      unit: "kg",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid source_type", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      source_type: "drink",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative kcal", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      kcal: -10,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional meal_slot_id and source_id", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      meal_slot_id: "123e4567-e89b-12d3-a456-426614174001",
      source_id: "123e4567-e89b-12d3-a456-426614174002",
    });
    expect(result.success).toBe(true);
  });

  it("accepts recipe as source_type", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      source_type: "recipe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero quantity", () => {
    const result = createEntrySchema.safeParse({
      ...validEntry,
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateEntrySchema", () => {
  it("accepts partial update", () => {
    const result = updateEntrySchema.safeParse({ quantity: 300 });
    expect(result.success).toBe(true);
  });

  it("accepts empty update", () => {
    const result = updateEntrySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid unit", () => {
    const result = updateEntrySchema.safeParse({ unit: "lbs" });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive quantity", () => {
    const result = updateEntrySchema.safeParse({ quantity: -5 });
    expect(result.success).toBe(false);
  });
});
