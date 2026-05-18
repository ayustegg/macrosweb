import { SubPage } from "@/components/layout/page-chrome";
import { RecipeForm } from "@/features/recipes/components/recipe-form";

export default function NewRecipePage() {
  return (
    <SubPage title="Nueva receta" backHref="/recipes">
      <RecipeForm />
    </SubPage>
  );
}
