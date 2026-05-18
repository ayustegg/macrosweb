import { getFoodById } from "@/features/foods/queries";
import { notFound } from "next/navigation";
import { EditFoodPageClient } from "./edit-food-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFoodPage({ params }: Props) {
  const { id } = await params;
  const food = await getFoodById(id);

  if (!food || food.source !== "custom") {
    notFound();
  }

  return (
    <div className="w-full px-page py-6 pb-3">
      <h1 className="text-2xl font-bold tracking-tight">Editar alimento</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {food.name}
      </p>
      <EditFoodPageClient food={food} />
    </div>
  );
}
