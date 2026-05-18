import Link from "next/link";
import { ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "@/features/recipes/types";

interface Props {
  recipe: Recipe;
  macrosPerServing?: { kcal: number };
}

export function RecipeCard({ recipe, macrosPerServing }: Props) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <Card size="sm" className="hover:bg-muted/50 transition-colors">
        <CardContent className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
            <ChefHat className="h-5 w-5 text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{recipe.name}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {recipe.servings}{" "}
              {recipe.servings === 1
                ? recipe.serving_name
                : `${recipe.serving_name}s`}
              {macrosPerServing != null && (
                <>
                  {" "}
                  · {Math.round(macrosPerServing.kcal)} kcal/
                  {recipe.serving_name}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
