import { describe, expect, it } from "vitest";
import { nutrientsSchema } from "./nutrients";

describe("nutrientsSchema", () => {
  it("accepts empty object", () => {
    const result = nutrientsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts all fields", () => {
    const result = nutrientsSchema.safeParse({
      fiber_g: 2.4,
      sugars_g: 10,
      saturated_fat_g: 1.2,
      trans_fat_g: 0.1,
      monounsaturated_fat_g: 3.5,
      polyunsaturated_fat_g: 2.1,
      cholesterol_mg: 0,
      sodium_mg: 1,
      salt_g: 0.01,
      potassium_mg: 107,
      calcium_mg: 6,
      iron_mg: 0.12,
      vitamin_a_mcg: 3,
      vitamin_c_mg: 4.6,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative fiber_g", () => {
    const result = nutrientsSchema.safeParse({ fiber_g: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative sodium_mg", () => {
    const result = nutrientsSchema.safeParse({ sodium_mg: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts partial fields", () => {
    const result = nutrientsSchema.safeParse({ fiber_g: 3, sugars_g: 5 });
    expect(result.success).toBe(true);
  });
});
