"use server";

import { createClient } from "@/lib/supabase/server";
import { mapOffProductToFood } from "@/lib/openfoodfacts/mapper";
import type { OffProduct } from "@/lib/openfoodfacts/mapper";
import type { ActionResult } from "@/types/actions";
import type { Food } from "@/types/food";
import { createFoodSchema, updateFoodSchema } from "./schemas";
import { searchFoods } from "./queries";

export type FoodWithSource = Food & { isLocal: boolean };

function extractNutrients(
  data: Record<string, unknown>
): Record<string, number> {
  const nutrientKeys = [
    "fiber_g",
    "sugars_g",
    "saturated_fat_g",
    "salt_g",
    "sodium_mg",
  ] as const;
  const nutrients: Record<string, number> = {};
  for (const key of nutrientKeys) {
    const val = data[key];
    if (val !== undefined && val !== null && val !== "") {
      nutrients[key] = Number(val);
    }
  }
  return nutrients;
}

export async function searchFoodsAction(
  query: string
): Promise<FoodWithSource[]> {
  const result = await searchFoods(query);
  return result.foods;
}

export async function createCustomFood(
  formData: FormData
): Promise<ActionResult<Food>> {
  const parsed = createFoodSchema.safeParse({
    name: formData.get("name"),
    source: "custom",
    brand: formData.get("brand") || undefined,
    barcode: formData.get("barcode") || undefined,
    off_id: formData.get("off_id") || undefined,
    serving_size_g: formData.get("serving_size_g") ?? undefined,
    serving_name: formData.get("serving_name") || undefined,
    is_liquid: formData.get("is_liquid") ?? undefined,
    density_g_per_ml: formData.get("density_g_per_ml") || undefined,
    kcal: formData.get("kcal") ?? undefined,
    protein_g: formData.get("protein_g") ?? undefined,
    carbs_g: formData.get("carbs_g") ?? undefined,
    fat_g: formData.get("fat_g") ?? undefined,
    fiber_g: formData.get("fiber_g") || undefined,
    sugars_g: formData.get("sugars_g") || undefined,
    saturated_fat_g: formData.get("saturated_fat_g") || undefined,
    salt_g: formData.get("salt_g") || undefined,
    sodium_mg: formData.get("sodium_mg") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((e) => [e.path.join("."), e.message])
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No hay sesión activa" };
  }

  const nutrients = extractNutrients(
    parsed.data as unknown as Record<string, unknown>
  );

  const { data, error } = await supabase
    .from("foods")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      source: "custom",
      brand: parsed.data.brand ?? null,
      barcode: parsed.data.barcode ?? null,
      off_id: parsed.data.off_id ?? null,
      serving_size_g: parsed.data.serving_size_g,
      serving_name: parsed.data.serving_name ?? null,
      density_g_per_ml: parsed.data.density_g_per_ml ?? null,
      kcal: parsed.data.kcal,
      protein_g: parsed.data.protein_g,
      carbs_g: parsed.data.carbs_g,
      fat_g: parsed.data.fat_g,
      nutrients: nutrients as never,
    } as never)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data as unknown as Food };
}

export async function updateCustomFood(
  id: string,
  formData: FormData
): Promise<ActionResult<Food>> {
  const parsed = updateFoodSchema.safeParse({
    name: formData.get("name") || undefined,
    brand: formData.get("brand") || undefined,
    barcode: formData.get("barcode") || undefined,
    off_id: formData.get("off_id") || undefined,
    serving_size_g: formData.get("serving_size_g") ?? undefined,
    serving_name: formData.get("serving_name") || undefined,
    is_liquid: formData.get("is_liquid") ?? undefined,
    density_g_per_ml: formData.get("density_g_per_ml") ?? undefined,
    kcal: formData.get("kcal") ?? undefined,
    protein_g: formData.get("protein_g") ?? undefined,
    carbs_g: formData.get("carbs_g") ?? undefined,
    fat_g: formData.get("fat_g") ?? undefined,
    fiber_g: formData.get("fiber_g") || undefined,
    sugars_g: formData.get("sugars_g") || undefined,
    saturated_fat_g: formData.get("saturated_fat_g") || undefined,
    salt_g: formData.get("salt_g") || undefined,
    sodium_mg: formData.get("sodium_mg") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((e) => [e.path.join("."), e.message])
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No hay sesión activa" };
  }

  const { data: existing } = await supabase
    .from("foods")
    .select("owner_id, nutrients")
    .eq("id", id)
    .single();

  if (!existing) {
    return { ok: false, error: "Alimento no encontrado" };
  }

  if (existing.owner_id !== user.id) {
    return { ok: false, error: "No tienes permiso para editar este alimento" };
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.name !== undefined) updates.name = d.name;
  if (d.brand !== undefined) updates.brand = d.brand;
  if (d.barcode !== undefined) updates.barcode = d.barcode;
  if (d.off_id !== undefined) updates.off_id = d.off_id;
  if (d.serving_size_g !== undefined) updates.serving_size_g = d.serving_size_g;
  if (d.serving_name !== undefined) updates.serving_name = d.serving_name;
  if (d.density_g_per_ml !== undefined)
    updates.density_g_per_ml = d.density_g_per_ml;
  if (d.kcal !== undefined) updates.kcal = d.kcal;
  if (d.protein_g !== undefined) updates.protein_g = d.protein_g;
  if (d.carbs_g !== undefined) updates.carbs_g = d.carbs_g;
  if (d.fat_g !== undefined) updates.fat_g = d.fat_g;

  const nutrientKeys = [
    "fiber_g",
    "sugars_g",
    "saturated_fat_g",
    "salt_g",
    "sodium_mg",
  ] as const;
  const hasAnyNutrient = nutrientKeys.some(
    (k) => d[k as keyof typeof d] !== undefined
  );
  if (hasAnyNutrient) {
    const existingNutrients =
      (existing as unknown as { nutrients: Record<string, number> | null })
        .nutrients ?? {};
    const merged = { ...existingNutrients };
    for (const key of nutrientKeys) {
      const val = d[key as keyof typeof d];
      if (val !== undefined) {
        merged[key] = Number(val);
      }
    }
    updates.nutrients = merged as never;
  }

  const { data, error } = await supabase
    .from("foods")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data as unknown as Food };
}

export async function deleteCustomFood(
  id: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No hay sesión activa" };
  }

  const { data: existing } = await supabase
    .from("foods")
    .select("owner_id, source")
    .eq("id", id)
    .single();

  if (!existing) {
    return { ok: false, error: "Alimento no encontrado" };
  }

  if (existing.source !== "custom" || existing.owner_id !== user.id) {
    return {
      ok: false,
      error: "No tienes permiso para eliminar este alimento",
    };
  }

  const { error } = await supabase.from("foods").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}

export async function upsertOffFood(
  offProduct: OffProduct
): Promise<ActionResult<Food>> {
  const supabase = await createClient();
  const mapped = mapOffProductToFood(offProduct);

  const existingId = mapped.off_id ?? mapped.barcode;
  if (!existingId) {
    return { ok: false, error: "El producto no tiene identificador" };
  }

  const { data: existing } = await supabase
    .from("foods")
    .select("id")
    .or(`off_id.eq.${existingId},barcode.eq.${mapped.barcode ?? ""}`)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing) {
    const { data, error } = await supabase
      .from("foods")
      .update({
        name: mapped.name,
        brand: mapped.brand,
        image_url: mapped.image_url,
        serving_size_g: mapped.serving_size_g,
        serving_name: mapped.serving_name,
        kcal: mapped.kcal,
        protein_g: mapped.protein_g,
        carbs_g: mapped.carbs_g,
        fat_g: mapped.fat_g,
        nutrients: mapped.nutrients as never,
        off_last_synced_at: now,
        updated_at: now,
      } as never)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data as unknown as Food };
  }

  const { data, error } = await supabase
    .from("foods")
    .insert({
      name: mapped.name,
      source: "off",
      brand: mapped.brand,
      barcode: mapped.barcode,
      off_id: mapped.off_id,
      image_url: mapped.image_url,
      serving_size_g: mapped.serving_size_g,
      serving_name: mapped.serving_name,
      kcal: mapped.kcal,
      protein_g: mapped.protein_g,
      carbs_g: mapped.carbs_g,
      fat_g: mapped.fat_g,
      nutrients: mapped.nutrients as never,
      off_last_synced_at: now,
    } as never)
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as unknown as Food };
}
