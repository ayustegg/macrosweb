import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/auth/verify",
  "/auth/reset",
  "/auth/callback",
];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  ) ||
  pathname === "/" ||
  pathname.startsWith("/api/auth");

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPublicRoute(pathname)) {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const profileCompleted =
    request.cookies.get("profile_completed")?.value === "true";

  if (pathname === "/onboarding") {
    if (profileCompleted) {
      return NextResponse.redirect(new URL("/today", request.url));
    }
    return supabaseResponse;
  }

  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  if (!profileCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return supabaseResponse;
}
