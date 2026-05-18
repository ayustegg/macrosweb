import { getRecipe } from "@/features/recipes/queries";
import { getCurrentUser } from "@/features/auth/queries";
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
  const { id } = await params;
  const { date } = await searchParams;

  const user = await getCurrentUser();
  if (!user) notFound();

  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  return <AddRecipeEntryClient recipe={recipe} date={date} />;
}
