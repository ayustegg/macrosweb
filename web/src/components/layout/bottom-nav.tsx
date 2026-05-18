"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Utensils } from "lucide-react";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";
import { useTabPrefetch } from "@/hooks/use-tab-prefetch";

const items = [
  { href: "/", label: "Día", Icon: Home },
  { href: "/foods", label: "Alimentos", Icon: Search },
  { href: "/recipes", label: "Recetas", Icon: Utensils },
] as const;

/** Bottom nav como footer del app shell (flujo del grid, no position:fixed). */
export function BottomNav() {
  const pathname = usePathname();
  const { startNavigation } = useTabNavigation();
  const prefetchTab = useTabPrefetch();

  return (
    <nav
      className="app-shell-chrome border-border/80 bg-background/95 w-full border-t backdrop-blur-xl backdrop-saturate-150"
      aria-label="Navegación principal"
    >
      <div
        className="px-page grid w-full grid-cols-3"
        style={{
          height:
            "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              onMouseEnter={() => {
                if (!active) prefetchTab(href);
              }}
              onTouchStart={() => {
                if (!active) prefetchTab(href);
              }}
              onClick={() => {
                if (!active) startNavigation(href);
              }}
              aria-label={label}
              className={`relative z-10 flex items-center justify-center transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="size-[24px]"
                strokeWidth={active ? 2.25 : 1.75}
                fill={active ? "currentColor" : "none"}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
