import { getDayLog } from "@/features/meals/queries";
import { TodayPageClient } from "./today-client";

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

export default async function TodayPage() {
  const date = todayDate();
  const dayLog = await getDayLog(date);

  return <TodayPageClient dayLog={dayLog} date={date} />;
}
