import { getCurrentUser } from "@/features/auth/queries";
import { getEntryById, getMealSlots } from "@/features/meals/queries";
import { notFound } from "next/navigation";
import { EditEntryClient } from "./edit-entry-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function EditEntryPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [{ id }, { date }] = await Promise.all([params, searchParams]);

  const [entryResult, mealSlots] = await Promise.all([
    getEntryById(id),
    getMealSlots(),
  ]);

  if (!entryResult) notFound();

  return (
    <EditEntryClient
      entry={entryResult.entry}
      mealSlots={mealSlots}
      date={date}
    />
  );
}
