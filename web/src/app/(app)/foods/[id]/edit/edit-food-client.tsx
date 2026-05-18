"use client";

import { FoodForm } from "@/features/foods/components/food-form";
import type { Food } from "@/types/food";

interface Props {
  food: Food;
}

export function EditFoodPageClient({ food }: Props) {
  return <FoodForm food={food} />;
}
