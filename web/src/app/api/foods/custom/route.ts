import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Food } from "@/types/food";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ foods: [] });
  }

  const { data } = await supabase
    .from("foods")
    .select("*")
    .eq("owner_id", user.id)
    .eq("source", "custom")
    .order("created_at", { ascending: false });

  return NextResponse.json({ foods: (data as unknown as Food[]) ?? [] });
}
