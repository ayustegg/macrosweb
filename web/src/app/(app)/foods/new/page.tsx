"use client";

import { useSearchParams } from "next/navigation";
import { FoodForm } from "@/features/foods/components/food-form";

export default function NewFoodPage() {
  const searchParams = useSearchParams();
  const prefillName = searchParams.get("name") ?? undefined;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo alimento</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Crea un alimento personalizado
      </p>
      <FoodForm prefillName={prefillName} />
    </div>
  );
}
