import { describe, expect, it, vi, beforeEach } from "vitest";
import type { OffProduct } from "@/lib/openfoodfacts/mapper";

const mockGetUser = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockMapOffProductToFood = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/openfoodfacts/mapper", () => ({
  mapOffProductToFood: mockMapOffProductToFood,
}));

import {
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  upsertOffFood,
} from "@/features/foods/actions";

const makeFormData = (values: Record<string, string | undefined>) => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) fd.set(key, value);
  }
  return fd;
};

const mockUser = { id: "user-1" };
const aResult = (overrides: Record<string, unknown> = {}) => ({
  data: {
    id: "food-1",
    owner_id: "user-1",
    source: "custom",
    brand: null,
    barcode: null,
    off_id: null,
    name: "Test Food",
    serving_size_g: 100,
    serving_name: null,
    density_g_per_ml: null,
    kcal: 100,
    protein_g: 10,
    carbs_g: 20,
    fat_g: 5,
    nutrients: {},
    image_url: null,
    off_last_synced_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  },
  error: null,
});

const errorResult = (message: string) => ({ data: null, error: { message } });

const singleSelect = vi.fn();
const insertSelectSingle = vi.fn();
const updateSelectSingle = vi.fn();
const deleteSelectSingle = vi.fn();

function resetMocks() {
  vi.clearAllMocks();
  singleSelect.mockReset();
  insertSelectSingle.mockReset();
  updateSelectSingle.mockReset();
  deleteSelectSingle.mockReset();

  singleSelect.mockResolvedValue({ data: null, error: null });
  insertSelectSingle.mockResolvedValue({ data: null, error: null });
  updateSelectSingle.mockResolvedValue({ data: null, error: null });
  deleteSelectSingle.mockResolvedValue({ data: null, error: null });

  mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  mockFrom.mockReturnValue({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: insertSelectSingle,
      })),
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: singleSelect,
        maybeSingle: singleSelect,
      })),
      or: vi.fn(() => ({
        maybeSingle: singleSelect,
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: updateSelectSingle,
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  });
}

beforeEach(resetMocks);

describe("createCustomFood", () => {
  it("creates a custom food successfully", async () => {
    insertSelectSingle.mockResolvedValue(aResult());

    const result = await createCustomFood(
      makeFormData({
        name: "Arroz",
        kcal: "130",
        protein_g: "2.7",
        carbs_g: "28",
        fat_g: "0.3",
      })
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Test Food");
    }
  });

  it("returns validation error for missing name", async () => {
    const result = await createCustomFood(
      makeFormData({
        kcal: "130",
        protein_g: "2.7",
        carbs_g: "28",
        fat_g: "0.3",
      })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Datos inválidos");
      expect(result.fieldErrors).toBeDefined();
    }
  });

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await createCustomFood(
      makeFormData({
        name: "Arroz",
        kcal: "130",
        protein_g: "2.7",
        carbs_g: "28",
        fat_g: "0.3",
      })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("No hay sesión activa");
    }
  });

  it("returns error on DB failure", async () => {
    insertSelectSingle.mockResolvedValue(errorResult("Database error"));

    const result = await createCustomFood(
      makeFormData({
        name: "Arroz",
        kcal: "130",
        protein_g: "2.7",
        carbs_g: "28",
        fat_g: "0.3",
      })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Database error");
    }
  });
});

describe("updateCustomFood", () => {
  it("updates a custom food successfully", async () => {
    singleSelect.mockResolvedValue({
      data: { owner_id: "user-1" },
      error: null,
    });
    updateSelectSingle.mockResolvedValue(aResult());

    const result = await updateCustomFood(
      "food-1",
      makeFormData({ name: "Arroz integral" })
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Test Food");
    }
  });

  it("returns error when food is not found", async () => {
    singleSelect.mockResolvedValue({ data: null, error: null });

    const result = await updateCustomFood(
      "food-404",
      makeFormData({ name: "Arroz integral" })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Alimento no encontrado");
    }
  });

  it("returns error when not owner", async () => {
    singleSelect.mockResolvedValue({
      data: { owner_id: "other-user" },
      error: null,
    });

    const result = await updateCustomFood(
      "food-1",
      makeFormData({ name: "Arroz integral" })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("No tienes permiso para editar este alimento");
    }
  });
});

describe("deleteCustomFood", () => {
  it("deletes a custom food successfully", async () => {
    singleSelect.mockResolvedValue({
      data: { owner_id: "user-1", source: "custom" },
      error: null,
    });

    const result = await deleteCustomFood("food-1");

    expect(result.ok).toBe(true);
  });

  it("returns error when food is not found", async () => {
    singleSelect.mockResolvedValue({ data: null, error: null });

    const result = await deleteCustomFood("food-404");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Alimento no encontrado");
    }
  });

  it("refuses to delete an OFF-sourced food", async () => {
    singleSelect.mockResolvedValue({
      data: { owner_id: null, source: "off" },
      error: null,
    });

    const result = await deleteCustomFood("food-off");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(
        "No tienes permiso para eliminar este alimento"
      );
    }
  });
});

describe("upsertOffFood", () => {
  const offProduct: OffProduct = {
    code: "3256221337583",
    product_name: "Manzana",
    nutriments: { "energy-kcal_100g": 52 },
  };

  const mappedFood = {
    id: "3256221337583",
    owner_id: null,
    source: "off" as const,
    brand: null,
    barcode: "3256221337583",
    off_id: "3256221337583",
    name: "Manzana",
    serving_size_g: 100,
    serving_name: null,
    density_g_per_ml: null,
    kcal: 52,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    nutrients: {},
    image_url: null,
    off_last_synced_at: "2026-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  it("inserts a new OFF food", async () => {
    mockMapOffProductToFood.mockReturnValue(mappedFood);
    singleSelect.mockResolvedValue({ data: null, error: null });
    insertSelectSingle.mockResolvedValue(aResult({ source: "off" }));

    const result = await upsertOffFood(offProduct);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Test Food");
    }
  });

  it("updates an existing OFF food by off_id", async () => {
    mockMapOffProductToFood.mockReturnValue(mappedFood);
    singleSelect.mockResolvedValue({
      data: { id: "existing-food" },
      error: null,
    });
    updateSelectSingle.mockResolvedValue(aResult({ source: "off" }));

    const result = await upsertOffFood(offProduct);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Test Food");
    }
  });

  it("returns error when product has no identifier", async () => {
    mockMapOffProductToFood.mockReturnValue({
      ...mappedFood,
      off_id: null,
      barcode: null,
    });

    const result = await upsertOffFood(offProduct);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("El producto no tiene identificador");
    }
  });
});
