import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface MealSlot {
  id: string;
  name: string;
  order_index: number;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ slots: [] });
  }

  const { data } = await supabase
    .from("meal_slots")
    .select("id, name, order_index")
    .eq("owner_id", user.id)
    .order("order_index");

  return NextResponse.json({ slots: (data ?? []) as MealSlot[] });
}
