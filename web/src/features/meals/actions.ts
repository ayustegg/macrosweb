"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import type { Entry } from "@/types/entry";
import { addEntryActionSchema, updateEntrySchema } from "./schemas";
import { getOrCreateDayLog, recalculateDayLogTotals } from "./queries";
import { computeEntrySnapshot } from "./domain";
import type { Food } from "@/types/food";

async function getSourceFood(sourceId: string): Promise<Food> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("id", sourceId)
    .single();

  if (!data) {
    throw new Error("Alimento no encontrado");
  }

  return data as unknown as Food;
}

export async function addEntry(
  formData: FormData
): Promise<ActionResult<Entry>> {
  const parsed = addEntryActionSchema.safeParse({
    date: formData.get("date"),
    meal_slot_id: formData.get("meal_slot_id") || undefined,
    source_type: formData.get("source_type"),
    source_id: formData.get("source_id"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
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

  const { date, meal_slot_id, source_type, source_id, quantity, unit } =
    parsed.data;

  try {
    const food = await getSourceFood(source_id);

    const snapshot = computeEntrySnapshot(
      {
        kcal: food.kcal,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        nutrients: food.nutrients as Record<string, number>,
        serving_size_g: food.serving_size_g,
        density_g_per_ml: food.density_g_per_ml,
      },
      quantity,
      unit
    );

    const dayLog = await getOrCreateDayLog(date);

    const { data: maxPos } = await supabase
      .from("entries")
      .select("position")
      .eq("day_log_id", dayLog.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = (maxPos?.position ?? -1) + 1;

    const { data: entry, error } = await supabase
      .from("entries")
      .insert({
        day_log_id: dayLog.id,
        meal_slot_id: meal_slot_id ?? null,
        source_type,
        source_id,
        source_name: food.name,
        quantity,
        unit,
        kcal: snapshot.kcal,
        protein_g: snapshot.protein_g,
        carbs_g: snapshot.carbs_g,
        fat_g: snapshot.fat_g,
        nutrients: snapshot.nutrients as never,
        position: nextPosition,
      })
      .select("*")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    await recalculateDayLogTotals(dayLog.id);

    revalidatePath(`/today?date=${date}`);

    return { ok: true, data: entry as unknown as Entry };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al añadir entrada",
    };
  }
}

export async function updateEntry(
  id: string,
  formData: FormData
): Promise<ActionResult<Entry>> {
  const parsed = updateEntrySchema.safeParse({
    meal_slot_id: formData.get("meal_slot_id") || undefined,
    quantity: formData.get("quantity") ?? undefined,
    unit: formData.get("unit") ?? undefined,
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
    .from("entries")
    .select("*, day_logs!inner(owner_id, date)")
    .eq("id", id)
    .single();

  if (!existing) {
    return { ok: false, error: "Entrada no encontrada" };
  }

  const entry = existing as unknown as Entry;
  const dayLog = (
    existing as unknown as { day_logs: { owner_id: string; date: string } }
  ).day_logs;

  if (dayLog.owner_id !== user.id) {
    return { ok: false, error: "No tienes permiso para editar esta entrada" };
  }

  if (!entry.source_id) {
    return {
      ok: false,
      error: "No se puede actualizar: falta referencia al origen",
    };
  }

  try {
    const quantity = parsed.data.quantity ?? entry.quantity;
    const unit = parsed.data.unit ?? entry.unit;

    const food =
      entry.source_type === "food"
        ? await getSourceFood(entry.source_id)
        : null;

    if (!food) {
      return { ok: false, error: "Origen no soportado para recálculo" };
    }

    const snapshot = computeEntrySnapshot(
      {
        kcal: food.kcal,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        nutrients: food.nutrients as Record<string, number>,
        serving_size_g: food.serving_size_g,
        density_g_per_ml: food.density_g_per_ml,
      },
      quantity,
      unit
    );

    const updates: Record<string, unknown> = {
      quantity,
      unit,
      kcal: snapshot.kcal,
      protein_g: snapshot.protein_g,
      carbs_g: snapshot.carbs_g,
      fat_g: snapshot.fat_g,
      nutrients: snapshot.nutrients,
    };

    if (parsed.data.meal_slot_id !== undefined) {
      updates.meal_slot_id = parsed.data.meal_slot_id;
    }

    const { data: updated, error } = await supabase
      .from("entries")
      .update(updates as never)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    await recalculateDayLogTotals(entry.day_log_id);

    revalidatePath(`/today?date=${dayLog.date}`);

    return { ok: true, data: updated as unknown as Entry };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al actualizar entrada",
    };
  }
}

export async function deleteEntry(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No hay sesión activa" };
  }

  const { data: existing } = await supabase
    .from("entries")
    .select("*, day_logs!inner(owner_id, date)")
    .eq("id", id)
    .single();

  if (!existing) {
    return { ok: false, error: "Entrada no encontrada" };
  }

  const entry = existing as unknown as Entry;
  const dayLog = (
    existing as unknown as { day_logs: { owner_id: string; date: string } }
  ).day_logs;

  if (dayLog.owner_id !== user.id) {
    return { ok: false, error: "No tienes permiso para eliminar esta entrada" };
  }

  const { error } = await supabase.from("entries").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  await recalculateDayLogTotals(entry.day_log_id);

  revalidatePath(`/today?date=${dayLog.date}`);

  return { ok: true, data: undefined };
}
