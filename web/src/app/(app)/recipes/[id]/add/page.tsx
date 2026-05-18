import { getRecipe } from "@/features/recipes/queries";
import { getCurrentUser } from "@/features/auth/queries";
import { getMealSlots } from "@/features/meals/queries";
import { notFound } from "next/navigation";
import { AddRecipeEntryClient } from "./add-recipe-entry-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function AddRecipeEntryPage({
  params,
  searchParams,
}: Props) {
  const [{ id }, { date }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  if (!user) notFound();

  const [recipe, mealSlots] = await Promise.all([
    getRecipe(id),
    getMealSlots(),
  ]);
  if (!recipe) notFound();

  return (
    <AddRecipeEntryClient recipe={recipe} date={date} mealSlots={mealSlots} />
  );
}
