import { describe, expect, it } from "vitest";
import {
  createRecipeSchema,
  updateRecipeSchema,
  addRecipeItemSchema,
} from "./schemas";

describe("createRecipeSchema", () => {
  it("validates a valid recipe", () => {
    const data = {
      name: "Ensalada César",
      servings: 2,
      serving_name: "Porción",
    };

    const result = createRecipeSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ensalada César");
      expect(result.data.servings).toBe(2);
    }
  });

  it("rejects recipe with empty name", () => {
    const data = {
      name: "",
      servings: 1,
      serving_name: "Porción",
    };

    const result = createRecipeSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects recipe with zero servings", () => {
    const data = {
      name: "Mi receta",
      servings: 0,
      serving_name: "Porción",
    };

    const result = createRecipeSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("accepts optional instructions", () => {
    const data = {
      name: "Mi receta",
      servings: 1,
      serving_name: "Porción",
      instructions: "Mezclar y cocinar",
    };

    const result = createRecipeSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("uses default serving_name if not provided", () => {
    const data = {
      name: "Mi receta",
      servings: 2,
    };

    const result = createRecipeSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.serving_name).toBe("porción");
    }
  });
});

describe("updateRecipeSchema", () => {
  it("allows partial updates", () => {
    const data = {
      name: "Nuevo nombre",
    };

    const result = updateRecipeSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateRecipeSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("validates servings if provided", () => {
    const data = {
      servings: 0,
    };

    const result = updateRecipeSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("allows updating instructions", () => {
    const data = {
      instructions: "Nuevas instrucciones",
    };

    const result = updateRecipeSchema.safeParse(data);

    expect(result.success).toBe(true);
  });
});

describe("addRecipeItemSchema", () => {
  it("validates a valid recipe item", () => {
    const data = {
      food_id: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 100,
      unit: "g",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(100);
    }
  });

  it("coerces string quantity to number", () => {
    const data = {
      food_id: "550e8400-e29b-41d4-a716-446655440000",
      quantity: "150",
      unit: "g",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(150);
    }
  });

  it("rejects zero quantity", () => {
    const data = {
      food_id: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 0,
      unit: "g",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects invalid unit", () => {
    const data = {
      food_id: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 100,
      unit: "kg",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("accepts serving as unit", () => {
    const data = {
      food_id: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 2,
      unit: "serving",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for food_id", () => {
    const data = {
      food_id: "invalid-uuid",
      quantity: 100,
      unit: "g",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects missing food_id", () => {
    const data = {
      quantity: 100,
      unit: "g",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects quantity exceeding maximum", () => {
    const data = {
      food_id: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 10000,
      unit: "g",
    };

    const result = addRecipeItemSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});
