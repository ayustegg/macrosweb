import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: entry } = await supabase
    .from("entries")
    .select("*, day_logs!inner(owner_id)")
    .eq("id", id)
    .single();

  if (!entry) {
    return NextResponse.json(
      { error: "Entrada no encontrada" },
      { status: 404 }
    );
  }

  const dayLog = (entry as unknown as { day_logs: { owner_id: string } })
    .day_logs;
  if (dayLog.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(entry);
}
