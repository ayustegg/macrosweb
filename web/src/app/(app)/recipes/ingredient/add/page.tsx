"use client";

import { useSearchParams } from "next/navigation";
import { SubPage } from "@/components/layout/page-chrome";
import { IngredientAddForm } from "@/features/recipes/components/ingredient-add-form";

export default function AddIngredientPage() {
  const searchParams = useSearchParams();
  const returnHref = searchParams.get("return") ?? "/recipes/new";

  return (
    <SubPage title="Añadir ingrediente" backHref={returnHref}>
      <IngredientAddForm returnHref={returnHref} />
    </SubPage>
  );
}
