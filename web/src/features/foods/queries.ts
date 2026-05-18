import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  searchByName,
  getByBarcode as getOffByBarcode,
} from "@/lib/openfoodfacts/client";
import type { Food } from "@/types/food";

export interface SearchResult {
  foods: (Food & { isLocal: boolean })[];
  offAvailable: boolean;
}

export async function searchFoods(query: string): Promise<SearchResult> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return { foods: [], offAvailable: true };

  const [localResults, offResult] = await Promise.all([
    searchLocalFoods(normalized),
    searchByName(normalized),
  ]);

  const merged = new Map<string, Food & { isLocal: boolean }>();

  for (const food of localResults) {
    const key = food.barcode ?? food.id;
    merged.set(key, { ...food, isLocal: true });
  }

  for (const food of offResult.foods) {
    const key = food.barcode ?? food.id;
    if (!merged.has(key)) {
      merged.set(key, { ...food, isLocal: false });
    }
  }

  return {
    foods: Array.from(merged.values()),
    offAvailable: offResult.ok,
  };
}

export async function searchLocalFoods(query: string): Promise<Food[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const { data } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.%${normalized}%,barcode.ilike.%${normalized}%`)
    .order("source", { ascending: false })
    .limit(25);

  if (!data) return [];

  const foods = data as unknown as Food[];

  if (userId) {
    foods.sort((a, b) => {
      const aIsOwn = a.owner_id === userId ? 1 : 0;
      const bIsOwn = b.owner_id === userId ? 1 : 0;
      return bIsOwn - aIsOwn;
    });
  }

  return foods;
}

export async function getFoodById(id: string): Promise<Food | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("id", id)
    .single();

  return data as unknown as Food | null;
}

export async function getFoodByBarcode(barcode: string): Promise<Food | null> {
  const normalized = barcode.trim();
  if (!normalized) return null;

  const supabase = await createClient();
  const { data: local } = await supabase
    .from("foods")
    .select("*")
    .eq("barcode", normalized)
    .maybeSingle();

  if (local) return local as unknown as Food;

  return getOffByBarcode(normalized);
}
