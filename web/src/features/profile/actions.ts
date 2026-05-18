"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import { onboardingSchema, updateProfileSchema } from "./schemas";
import { suggestedMacros } from "./domain";

export async function completeOnboarding(
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    heightCm: formData.get("heightCm"),
    weightKg: formData.get("weightKg"),
    activityLevel: formData.get("activityLevel"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((e) => [e.path.join("."), e.message])
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No hay sesión activa" };
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { profile_completed_at: now },
  });
  if (metadataError) {
    return { ok: false, error: metadataError.message };
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: data.displayName,
    sex: data.sex,
    birth_date: data.birthDate,
    height_cm: data.heightCm,
    activity_level: data.activityLevel,
    timezone: data.timezone,
    profile_completed_at: now,
  });
  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: weightError } = await supabase.from("weight_logs").insert({
    owner_id: user.id,
    weight_kg: data.weightKg,
    date: today,
  });
  if (weightError) {
    return { ok: false, error: weightError.message };
  }

  const defaultSlots = [
    { owner_id: user.id, name: "Desayuno", order_index: 0 },
    { owner_id: user.id, name: "Almuerzo", order_index: 1 },
    { owner_id: user.id, name: "Comida", order_index: 2 },
    { owner_id: user.id, name: "Merienda", order_index: 3 },
    { owner_id: user.id, name: "Cena", order_index: 4 },
  ];

  const { error: slotsError } = await supabase
    .from("meal_slots")
    .insert(defaultSlots);
  if (slotsError) {
    return { ok: false, error: slotsError.message };
  }

  const age = new Date().getFullYear() - new Date(data.birthDate).getFullYear();
  const result = suggestedMacros(
    {
      sex: data.sex,
      weight_kg: data.weightKg,
      height_cm: data.heightCm,
      age,
      activity_level: data.activityLevel,
    },
    "maintain"
  );

  const goalData = {
    valid_from: today,
    kcal: result.kcal,
    protein_g: result.protein_g,
    carbs_g: result.carbs_g,
    fat_g: result.fat_g,
    is_auto: true,
  };

  const { data: existingGoal } = await supabase
    .from("goals")
    .select("id")
    .eq("owner_id", user.id)
    .is("valid_to", null)
    .maybeSingle();

  let goalError;
  if (existingGoal) {
    const { error } = await supabase
      .from("goals")
      .update(goalData)
      .eq("id", existingGoal.id);
    goalError = error;
  } else {
    const { error } = await supabase
      .from("goals")
      .insert({ owner_id: user.id, ...goalData });
    goalError = error;
  }
  if (goalError) {
    return { ok: false, error: goalError.message };
  }

  const cookieStore = await cookies();
  cookieStore.set("profile_completed", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/today");
}

export async function updateProfile(
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName") ?? undefined,
    sex: formData.get("sex") ?? undefined,
    birthDate: formData.get("birthDate") ?? undefined,
    heightCm: formData.get("heightCm") ?? undefined,
    activityLevel: formData.get("activityLevel") ?? undefined,
    timezone: formData.get("timezone") ?? undefined,
    avatarUrl: formData.get("avatarUrl") ?? undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((e) => [e.path.join("."), e.message])
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "No hay sesión activa" };
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.displayName !== undefined) updates.display_name = d.displayName;
  if (d.sex !== undefined) updates.sex = d.sex;
  if (d.birthDate !== undefined) updates.birth_date = d.birthDate;
  if (d.heightCm !== undefined) updates.height_cm = d.heightCm;
  if (d.activityLevel !== undefined) updates.activity_level = d.activityLevel;
  if (d.timezone !== undefined) updates.timezone = d.timezone;
  if (d.avatarUrl !== undefined) updates.avatar_url = d.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}
