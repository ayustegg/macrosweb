import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr";
import { env } from "@/env";

export function createBrowserClient() {
  return createBrowserClientSSR(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
