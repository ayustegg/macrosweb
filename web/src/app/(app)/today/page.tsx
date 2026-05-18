import { getCurrentUser } from "@/features/auth/queries";
import { getDayLog } from "@/features/meals/queries";
import { getActiveGoal } from "@/features/profile/queries";
import { TodayPageClient } from "./today-client";
import { notFound } from "next/navigation";

function todayDate(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function TodayPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { date: paramDate } = await searchParams;
  const date = paramDate ?? todayDate();

  const [dayLog, goal] = await Promise.all([
    getDayLog(date),
    getActiveGoal(user.id),
  ]);

  return <TodayPageClient dayLog={dayLog} goal={goal} date={date} />;
}
