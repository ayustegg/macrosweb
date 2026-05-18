import { notFound } from "next/navigation";
import { getRecipe } from "@/features/recipes/queries";
import { RecipeDetail } from "@/features/recipes/components/recipe-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  return <RecipeDetail recipe={recipe} />;
}
