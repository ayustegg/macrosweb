import Link from "next/link";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listRecipes } from "@/features/recipes/queries";
import { RecipeListClient } from "@/features/recipes/components/recipe-list-client";

export default async function RecipesPage() {
  const recipes = await listRecipes();

  return (
    <div className="w-full px-page pt-2 pb-24">
      <div className="flex items-baseline justify-between pb-3.5">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">
          Recetas
        </h1>
        <Button asChild size="sm">
          <Link href="/recipes/new">
            <Plus className="size-4" />
            Nueva
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-12 pb-16 text-center">
          <div className="mb-5 grid size-32 place-items-center rounded-full bg-secondary">
            <ChefHat className="size-16 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="mb-1 text-lg font-semibold">Aún no tienes recetas</h2>
          <p className="text-muted-foreground mb-6 max-w-64 text-sm leading-relaxed">
            Crea tu primera receta combinando alimentos.
          </p>
          <Button asChild size="lg">
            <Link href="/recipes/new">Crea tu primera receta →</Link>
          </Button>
        </div>
      ) : (
        <RecipeListClient recipes={recipes} />
      )}
    </div>
  );
}
