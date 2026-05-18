import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}

/** Legacy route — entry edit is now `/entry/[id]/edit`. */
export default async function TodayEntryEditRedirect({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { date } = await searchParams;
  const suffix = date ? `?date=${date}` : "";
  redirect(`/entry/${id}/edit${suffix}`);
}
