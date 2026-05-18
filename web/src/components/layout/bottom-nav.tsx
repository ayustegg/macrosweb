"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Utensils, User } from "lucide-react";

const items = [
  { href: "/", label: "Hoy", Icon: Home },
  { href: "/foods", label: "Alimentos", Icon: Search },
  { href: "/recipes", label: "Recetas", Icon: Utensils },
  { href: "/profile", label: "Perfil", Icon: User },
] as const;

/** Bottom nav como footer del app shell (flujo del grid, no position:fixed). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-border/80 bg-background/95 pb-safe w-full border-t backdrop-blur-xl backdrop-saturate-150"
      aria-label="Navegación principal"
    >
      <div
        className="px-page grid w-full grid-cols-4"
        style={{ height: "var(--bottom-nav-height)" }}
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
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="size-[22px]"
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
