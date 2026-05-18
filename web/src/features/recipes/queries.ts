import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Recipe, RecipeWithItems, RecipeItemWithFood } from "./types";

export async function listRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (data as unknown as Recipe[]) ?? [];
}

export async function getRecipe(id: string): Promise<RecipeWithItems | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!recipe) return null;

  const { data: items } = await supabase
    .from("recipe_items")
    .select("*, food:food_id(*)")
    .eq("recipe_id", id);

  const typedRecipe = recipe as unknown as Recipe;
  const typedItems = (items ?? []) as unknown as RecipeItemWithFood[];

  return { ...typedRecipe, items: typedItems };
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const normalized = query.trim();
  if (!normalized) return listRecipes();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("owner_id", user.id)
    .ilike("name", `%${normalized}%`)
    .order("updated_at", { ascending: false });

  return (data as unknown as Recipe[]) ?? [];
}

export async function getRecipeItemsWithFoods(
  recipeId: string
): Promise<RecipeItemWithFood[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("recipe_items")
    .select("*, food:food_id(*)")
    .eq("recipe_id", recipeId);

  return (data ?? []) as unknown as RecipeItemWithFood[];
}
