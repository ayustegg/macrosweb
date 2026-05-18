import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/types/entry";
import type { MealSlot } from "@/features/meals/types";

export interface DayLogWithTotals {
  id: string;
  date: string;
  owner_id: string;
  total_kcal: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  notes: string | null;
}

export interface DayLogWithEntries extends DayLogWithTotals {
  entries: Entry[];
  slots: Record<string, { entries: Entry[]; totals: SlotTotals }>;
}

export interface SlotTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

function aggregateBySlot(
  entries: Entry[]
): Record<string, { entries: Entry[]; totals: SlotTotals }> {
  const slots: Record<string, Entry[]> = {};

  for (const entry of entries) {
    const key = entry.meal_slot_id ?? "__no_slot";
    if (!slots[key]) slots[key] = [];
    slots[key].push(entry);
  }

  const result: Record<string, { entries: Entry[]; totals: SlotTotals }> = {};
  for (const [key, slotEntries] of Object.entries(slots)) {
    const totals = slotEntries.reduce(
      (acc, e) => ({
        kcal: acc.kcal + Number(e.kcal),
        protein_g: acc.protein_g + Number(e.protein_g),
        carbs_g: acc.carbs_g + Number(e.carbs_g),
        fat_g: acc.fat_g + Number(e.fat_g),
      }),
      { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
    result[key] = { entries: slotEntries, totals };
  }

  return result;
}

export async function getMealSlots(): Promise<MealSlot[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("meal_slots")
    .select("id, name, order_index")
    .eq("owner_id", user.id)
    .order("order_index");

  return (data ?? []) as MealSlot[];
}

export async function getDayLog(
  date: string
): Promise<DayLogWithEntries | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: dayLog } = await supabase
    .from("day_logs")
    .select("*")
    .eq("owner_id", user.id)
    .eq("date", date)
    .single();

  if (!dayLog) return null;

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("day_log_id", dayLog.id)
    .order("position", { ascending: true });

  const parsedEntries = (entries as unknown as Entry[]) ?? [];

  return {
    id: dayLog.id,
    date: dayLog.date,
    owner_id: dayLog.owner_id,
    total_kcal: Number(dayLog.total_kcal),
    total_protein_g: Number(dayLog.total_protein_g),
    total_carbs_g: Number(dayLog.total_carbs_g),
    total_fat_g: Number(dayLog.total_fat_g),
    notes: dayLog.notes,
    entries: parsedEntries,
    slots: aggregateBySlot(parsedEntries),
  };
}

export async function getOrCreateDayLog(
  date: string
): Promise<DayLogWithEntries> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No hay sesión activa");
  }

  const existing = await getDayLog(date);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("day_logs")
    .insert({
      owner_id: user.id,
      date,
      total_kcal: 0,
      total_protein_g: 0,
      total_carbs_g: 0,
      total_fat_g: 0,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Error al crear el registro del día");
  }

  return {
    id: data.id,
    date: data.date,
    owner_id: data.owner_id,
    total_kcal: Number(data.total_kcal),
    total_protein_g: Number(data.total_protein_g),
    total_carbs_g: Number(data.total_carbs_g),
    total_fat_g: Number(data.total_fat_g),
    notes: data.notes,
    entries: [],
    slots: {},
  };
}

export async function getEntryById(
  id: string
): Promise<{ entry: Entry; dayLog: DayLogWithTotals } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: entry } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!entry) return null;

  const { data: dayLog } = await supabase
    .from("day_logs")
    .select("*")
    .eq("id", (entry as unknown as Entry).day_log_id)
    .single();

  if (!dayLog) return null;

  return {
    entry: entry as unknown as Entry,
    dayLog: dayLog as unknown as DayLogWithTotals,
  };
}

export async function recalculateDayLogTotals(dayLogId: string): Promise<void> {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("entries")
    .select("kcal, protein_g, carbs_g, fat_g")
    .eq("day_log_id", dayLogId);

  const rows = (entries ?? []) as {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }[];

  const totals = rows.reduce(
    (acc, e) => ({
      total_kcal: acc.total_kcal + Number(e.kcal),
      total_protein_g: acc.total_protein_g + Number(e.protein_g),
      total_carbs_g: acc.total_carbs_g + Number(e.carbs_g),
      total_fat_g: acc.total_fat_g + Number(e.fat_g),
    }),
    { total_kcal: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0 }
  );

  await supabase
    .from("day_logs")
    .update(totals as never)
    .eq("id", dayLogId);
}
