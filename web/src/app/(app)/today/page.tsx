import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

/** Legacy route — home is now `/`. */
export default async function TodayRedirect({ searchParams }: Props) {
  const { date } = await searchParams;
  redirect(date ? `/?date=${date}` : "/");
}
