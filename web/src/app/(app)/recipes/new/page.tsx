import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeForm } from "@/features/recipes/components/recipe-form";

export default function NewRecipePage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-xs" asChild>
          <Link href="/recipes" aria-label="Volver a recetas">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Nueva receta</h1>
      </div>

      <RecipeForm />
    </div>
  );
}
