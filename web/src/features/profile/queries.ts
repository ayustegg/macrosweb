import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Goal = Database["public"]["Tables"]["goals"]["Row"];

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

export async function getActiveGoal(userId: string): Promise<Goal | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("owner_id", userId)
    .is("valid_to", null)
    .single();

  return data;
}
