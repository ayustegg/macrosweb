import { getCurrentUser } from "@/features/auth/queries";
import { getFoodById } from "@/features/foods/queries";
import { getMealSlots } from "@/features/meals/queries";
import { notFound } from "next/navigation";
import { AddFoodEntryClient } from "./add-food-entry-client";

interface Props {
  searchParams: Promise<{
    food?: string;
    slot?: string;
    date?: string;
  }>;
}

export default async function AddFoodEntryPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { food: foodId, slot: defaultSlotId, date } = await searchParams;
  if (!foodId) notFound();

  const [food, mealSlots] = await Promise.all([
    getFoodById(foodId),
    getMealSlots(),
  ]);

  if (!food) notFound();

  return (
    <AddFoodEntryClient
      food={food}
      mealSlots={mealSlots}
      defaultSlotId={defaultSlotId}
      date={date}
    />
  );
}
