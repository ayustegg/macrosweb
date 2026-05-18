"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import {
  createRecipeSchema,
  updateRecipeSchema,
  addRecipeItemSchema,
} from "./schemas";
import type { Recipe, RecipeItem } from "./types";

export async function createRecipe(
  input: unknown
): Promise<ActionResult<Recipe>> {
  const parsed = createRecipeSchema.safeParse(input);
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
  if (!user) return { ok: false, error: "No hay sesión activa" };

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      servings: parsed.data.servings,
      serving_name: parsed.data.serving_name,
      instructions: parsed.data.instructions ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Error al crear la receta");
  }

  revalidatePath("/recipes");
  return { ok: true, data: data as unknown as Recipe };
}

export async function addRecipeItem(
  recipeId: string,
  input: unknown
): Promise<ActionResult<RecipeItem>> {
  const parsed = addRecipeItemSchema.safeParse(input);
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
  if (!user) return { ok: false, error: "No hay sesión activa" };

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("owner_id", user.id)
    .single();
  if (!recipe) return { ok: false, error: "Receta no encontrada" };

  const { data, error } = await supabase
    .from("recipe_items")
    .insert({
      recipe_id: recipeId,
      food_id: parsed.data.food_id,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Error al añadir el ingrediente");
  }

  revalidatePath(`/recipes/${recipeId}`);
  return { ok: true, data: data as unknown as RecipeItem };
}

export async function removeRecipeItem(
  itemId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa" };

  const { data: item } = await supabase
    .from("recipe_items")
    .select("recipe_id")
    .eq("id", itemId)
    .single();
  if (!item) return { ok: false, error: "Ingrediente no encontrado" };

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", item.recipe_id)
    .eq("owner_id", user.id)
    .single();
  if (!recipe)
    return { ok: false, error: "No tienes permiso para esta acción" };

  const { error } = await supabase
    .from("recipe_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/recipes/${item.recipe_id}`);
  return { ok: true, data: undefined };
}

export async function updateRecipe(
  id: string,
  input: unknown
): Promise<ActionResult<Recipe>> {
  const parsed = updateRecipeSchema.safeParse(input);
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
  if (!user) return { ok: false, error: "No hay sesión activa" };

  const { data, error } = await supabase
    .from("recipes")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Error al actualizar la receta");
  }

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${id}`);
  return { ok: true, data: data as unknown as Recipe };
}

export async function deleteRecipe(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No hay sesión activa" };

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/recipes");
  return { ok: true, data: undefined };
}
