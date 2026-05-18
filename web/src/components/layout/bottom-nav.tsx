"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Utensils, User } from "lucide-react";

const items = [
  { href: "/today", label: "Hoy", Icon: Home },
  { href: "/foods", label: "Alimentos", Icon: Search },
  { href: "/recipes", label: "Recetas", Icon: Utensils },
  { href: "/profile", label: "Perfil", Icon: User },
] as const;

/** In-flow tab bar (not fixed). Safe-area padding is on the shell via pb-safe. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="app-bottom-nav border-border/80 bg-background/90 w-full shrink-0 border-t backdrop-blur-xl backdrop-saturate-150"
      aria-label="Navegación principal"
    >
      <div className="px-page pb-safe grid w-full grid-cols-4 pt-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={active ? 2.25 : 1.75}
                fill={active ? "currentColor" : "none"}
                aria-hidden
              />
              <span className="text-[10px] leading-none font-semibold tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
