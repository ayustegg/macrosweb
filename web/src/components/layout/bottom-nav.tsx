"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Utensils, User } from "lucide-react";

const items = [
  { href: "/today", label: "Hoy", Icon: Home },
  { href: "/foods/search", label: "Alimentos", Icon: Search },
  { href: "/recipes", label: "Recetas", Icon: Utensils },
  { href: "/profile", label: "Perfil", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-white pb-[env(safe-area-inset-bottom)] dark:border-zinc-800 dark:bg-black"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              active
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={active ? 2.5 : 1.5}
              aria-hidden
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
