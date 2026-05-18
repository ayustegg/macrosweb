"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { useHeaderBrandMotion } from "@/components/layout/header-brand-motion-provider";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";
import { useTabPrefetch } from "@/hooks/use-tab-prefetch";
import { cn } from "@/lib/utils";

interface Props {
  initials: string;
}

function getTabTitle(pathname: string): string {
  if (pathname === "/") return "Día";
  if (pathname === "/foods" || pathname.startsWith("/foods/")) return "Alimentos";
  if (pathname === "/recipes" || pathname.startsWith("/recipes/")) return "Recetas";
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return "Perfil";
  return "";
}

export function AppHeader({ initials }: Props) {
  const pathname = usePathname();
  const { isNavigating, startNavigation } = useTabNavigation();
  const prefetchTab = useTabPrefetch();
  const {
    rotation,
    transition,
    settleDurationMs,
    settleEasing,
    startHomeRefresh,
  } = useHeaderBrandMotion();

  const profileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");
  const tabTitle = getTabTitle(pathname);

  return (
    <header
      className="app-shell-chrome border-border/80 bg-background/90 w-full border-b backdrop-blur-xl backdrop-saturate-150"
      aria-busy={isNavigating}
    >
      <div className="px-page flex w-full flex-col gap-1.5 py-2">
        <h1 className="truncate text-center text-[15px] font-bold tracking-tight">
          {tabTitle}
        </h1>

        <div className="flex w-full items-center gap-3">
          <Link
            href="/"
            prefetch
            aria-label="Inicio"
            className="focus-visible:ring-ring flex shrink-0 items-center rounded-sm outline-none focus-visible:ring-2"
            onMouseEnter={() => prefetchTab("/")}
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                startHomeRefresh();
                return;
              }
              startNavigation("/");
            }}
          >
            <span
              className="inline-flex shrink-0 will-change-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: transition
                  ? `transform ${settleDurationMs}ms ${settleEasing}`
                  : "none",
              }}
              aria-hidden
            >
              <BrandMark size={36} />
            </span>
          </Link>

          <div className="flex-1" aria-hidden />

          <Link
            href="/profile"
          prefetch
          aria-label="Perfil"
          aria-current={profileActive ? "page" : undefined}
          onMouseEnter={() => prefetchTab("/profile")}
          onClick={() => {
            if (!profileActive) startNavigation("/profile");
          }}
          className={cn(
            "focus-visible:ring-ring relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold tracking-tight transition-colors outline-none focus-visible:ring-2",
            profileActive
              ? "border-foreground bg-foreground text-background shadow-app-1"
              : "border-foreground/80 bg-card text-accent-foreground shadow-app-1 hover:bg-muted/60"
          )}
        >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
