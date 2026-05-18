import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mapOffProductToFood } from "./mapper";
import { searchByName, getByBarcode } from "./client";
import type { OffProduct } from "./mapper";

const manzanaFixture = {
  code: "3256221337583",
  product_name: "Pomme",
  brands: "Pink Lady",
  image_url:
    "https://images.openfoodfacts.org/images/products/325/622/133/7583/1.jpg",
  nutriments: {
    "energy-kcal_100g": 52,
    proteins_100g: 0.3,
    carbohydrates_100g: 14,
    fat_100g: 0.2,
    fiber_100g: 2.4,
    sugars_100g: 10,
    "saturated-fat_100g": 0.1,
    sodium_100g: 100,
  },
  serving_size: "100 g",
} satisfies OffProduct;

describe("mapOffProductToFood", () => {
  it("maps a basic OFF product to Food", () => {
    const food = mapOffProductToFood(manzanaFixture);

    expect(food.source).toBe("off");
    expect(food.barcode).toBe("3256221337583");
    expect(food.off_id).toBe("3256221337583");
    expect(food.name).toBe("Pomme");
    expect(food.brand).toBe("Pink Lady");
    expect(food.image_url).toBe(
      "https://images.openfoodfacts.org/images/products/325/622/133/7583/1.jpg"
    );
    expect(food.owner_id).toBeNull();
  });

  it("extracts kcal from energy-kcal_100g", () => {
    const food = mapOffProductToFood(manzanaFixture);
    expect(food.kcal).toBe(52);
  });

  it("falls back to energy_100g / 4.184 when kcal field is missing", () => {
    const offProduct: OffProduct = {
      code: "test",
      product_name: "Test",
      nutriments: { energy_100g: 418 },
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.kcal).toBe(100);
  });

  it("extracts protein, carbs, fat", () => {
    const food = mapOffProductToFood(manzanaFixture);
    expect(food.protein_g).toBe(0.3);
    expect(food.carbs_g).toBe(14);
    expect(food.fat_g).toBe(0.2);
  });

  it("maps micro-nutrients", () => {
    const food = mapOffProductToFood(manzanaFixture);
    expect(food.nutrients.fiber_g).toBe(2.4);
    expect(food.nutrients.sugars_g).toBe(10);
    expect(food.nutrients.saturated_fat_g).toBe(0.1);
    expect(food.nutrients.sodium_mg).toBe(100);
  });

  it("skips nutrients with falsy values", () => {
    const offProduct: OffProduct = {
      code: "test",
      nutriments: { proteins_100g: 1 },
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.nutrients.fiber_g).toBeUndefined();
    expect(food.nutrients.sugars_g).toBeUndefined();
  });

  it("sets serving_size_g from serving_size string", () => {
    const food = mapOffProductToFood(manzanaFixture);
    expect(food.serving_size_g).toBe(100);
  });

  it("defaults serving_size_g to 100 when not provided", () => {
    const offProduct: OffProduct = {
      code: "test",
      product_name: "Test",
      nutriments: {},
      serving_size: null,
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.serving_size_g).toBe(100);
    expect(food.serving_name).toBeNull();
  });

  it("parses ml-based serving sizes", () => {
    const offProduct: OffProduct = {
      code: "test",
      product_name: "Jugo",
      nutriments: {},
      serving_size: "200 ml",
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.serving_size_g).toBe(200);
  });

  it("parses complex serving sizes like '1 pieza (150 g)'", () => {
    const offProduct: OffProduct = {
      code: "test",
      product_name: "Manzana",
      nutriments: {},
      serving_size: "1 pieza (150 g)",
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.serving_size_g).toBe(150);
  });

  it("sets fallback name when product_name is missing", () => {
    const offProduct: OffProduct = {
      code: "test",
      nutriments: {},
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.name).toBe("Producto sin nombre");
  });

  it("rounds values to 2 decimal places", () => {
    const offProduct: OffProduct = {
      code: "test",
      product_name: "Precision",
      nutriments: {
        "energy-kcal_100g": 52.567,
        proteins_100g: 3.3333,
      },
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.kcal).toBe(52.57);
    expect(food.protein_g).toBe(3.33);
  });

  it("extracts serving_name from serving_size", () => {
    const offProduct: OffProduct = {
      code: "test",
      product_name: "Coca",
      nutriments: {},
      serving_size: "330 ml",
    };
    const food = mapOffProductToFood(offProduct);
    expect(food.serving_name).toBe("330 ml");
  });
});

describe("searchByName", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns mapped Food array from search results", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          count: 2,
          products: [
            { code: "1", product_name: "Manzana", nutriments: {} },
            { code: "2", product_name: "Manzana Golden", nutriments: {} },
          ],
        }),
    });

    const results = await searchByName("manzana-1");

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe("Manzana");
    expect(results[1].name).toBe("Manzana Golden");
  });

  it("filters out products without a name", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          count: 2,
          products: [
            { code: "1", product_name: "Con nombre", nutriments: {} },
            { code: "2", nutriments: {} },
          ],
        }),
    });

    const results = await searchByName("filter-test");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Con nombre");
  });

  it("returns empty array on 5xx without throwing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 502 });

    const results = await searchByName("manzana-5xx");

    expect(results).toEqual([]);
  });

  it("returns empty array on network error without throwing", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const results = await searchByName("manzana-network");

    expect(results).toEqual([]);
  });

  it("returns empty array for empty query", async () => {
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch;

    const results = await searchByName("");

    expect(results).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("getByBarcode", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns mapped Food for a valid barcode", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          code: "5449000000996",
          product: {
            product_name: "Coca-Cola",
            brands: "Coca-Cola",
            nutriments: {
              "energy-kcal_100g": 42,
              proteins_100g: 0,
              carbohydrates_100g: 10.6,
              fat_100g: 0,
            },
            serving_size: "330 ml",
          },
          status: 1,
        }),
    });

    const food = await getByBarcode("5449000000996");

    expect(food).not.toBeNull();
    expect(food!.name).toBe("Coca-Cola");
    expect(food!.kcal).toBe(42);
    expect(food!.serving_size_g).toBe(330);
  });

  it("returns null when product is not found", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          code: "0000000000000",
          product: null,
          status: 0,
        }),
    });

    const food = await getByBarcode("0000000000000");

    expect(food).toBeNull();
  });

  it("returns null on network error without throwing", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Timeout"));

    const food = await getByBarcode("error-5449000000996");

    expect(food).toBeNull();
  });

  it("returns null for empty barcode", async () => {
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch;

    const food = await getByBarcode("");

    expect(food).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
