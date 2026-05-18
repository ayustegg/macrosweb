"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";
import {
  loginSchema,
  resetEmailSchema,
  resetPasswordSchema,
  signupSchema,
} from "./schemas";

export async function signup(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
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
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { email: parsed.data.email } };
}

export async function login(
  formData: FormData
): Promise<ActionResult<{ profileCompleted: boolean }>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Email o contraseña inválidos",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((e) => [e.path.join("."), e.message])
      ),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return {
        ok: false,
        error: "Email o contraseña incorrectos",
      };
    }
    return { ok: false, error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  let profileCompleted = user?.user_metadata?.profile_completed_at != null;

  if (!profileCompleted) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed_at")
      .eq("id", user!.id)
      .maybeSingle();
    profileCompleted = profile?.profile_completed_at != null;
  }

  cookieStore.set("profile_completed", String(profileCompleted), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { profileCompleted } };
}

export async function logout(): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestReset(
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = resetEmailSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Email inválido",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((e) => [e.path.join("."), e.message])
      ),
    };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/auth/reset` }
  );
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}

export async function confirmReset(
  formData: FormData
): Promise<ActionResult<void>> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
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
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
