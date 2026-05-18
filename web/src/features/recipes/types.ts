import type { Food } from "@/types/food";

export interface Recipe {
  id: string;
  owner_id: string;
  name: string;
  servings: number;
  serving_name: string;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  food_id: string | null;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface RecipeItemWithFood extends RecipeItem {
  food: Food;
}

export interface RecipeWithItems extends Recipe {
  items: RecipeItemWithFood[];
}

export interface RecipeMacros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface RecipeWithMacros extends Recipe {
  macros_total: RecipeMacros;
  macros_per_serving: RecipeMacros;
}
