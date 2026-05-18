import Link from "next/link";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabPage, EmptyState } from "@/components/layout/page-chrome";
import { listRecipes } from "@/features/recipes/queries";
import { RecipeListClient } from "@/features/recipes/components/recipe-list-client";

export default async function RecipesPage() {
  const recipes = await listRecipes();

  return (
    <TabPage
      title="Recetas"
      action={
        <Button asChild size="sm">
          <Link href="/recipes/new">
            <Plus className="size-4" />
            Nueva
          </Link>
        </Button>
      }
    >
      {recipes.length === 0 ? (
        <EmptyState
          icon={
            <ChefHat className="text-muted-foreground size-16" aria-hidden />
          }
          title="Aún no tienes recetas"
          description="Crea tu primera receta combinando alimentos."
          action={
            <Button asChild size="lg">
              <Link href="/recipes/new">Crea tu primera receta →</Link>
            </Button>
          }
        />
      ) : (
        <RecipeListClient recipes={recipes} />
      )}
    </TabPage>
  );
}
