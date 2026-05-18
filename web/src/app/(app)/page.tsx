import { getCurrentUser } from "@/features/auth/queries";
import { getDayLog, getMealSlots } from "@/features/meals/queries";
import { getProfile, getActiveGoal } from "@/features/profile/queries";
import { TodayPageClient } from "@/app/(app)/today-client";
import { notFound } from "next/navigation";

function todayInTimezone(tz: string): string {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function TodayPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [{ date: paramDate }, profile, mealSlots] = await Promise.all([
    searchParams,
    getProfile(user.id),
    getMealSlots(),
  ]);

  const tz = profile?.timezone ?? "UTC";
  const date = paramDate ?? todayInTimezone(tz);

  const [dayLog, goal] = await Promise.all([
    getDayLog(date),
    getActiveGoal(user.id),
  ]);

  return (
    <TodayPageClient
      key={date}
      dayLog={dayLog}
      goal={goal}
      mealSlots={mealSlots}
      date={date}
      timezone={tz}
    />
  );
}
