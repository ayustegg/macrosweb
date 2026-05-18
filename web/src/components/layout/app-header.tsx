"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";
import { useHeaderBrandMotion } from "@/components/layout/header-brand-motion-provider";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";
import { useTabPrefetch } from "@/hooks/use-tab-prefetch";
import { cn } from "@/lib/utils";

interface Props {
  initials: string;
}

export function AppHeader({ initials }: Props) {
  const pathname = usePathname();
  const { isNavigating, startNavigation } = useTabNavigation();
  const prefetchTab = useTabPrefetch();
  const { rotation, transition, dateWobble } = useHeaderBrandMotion();

  const profileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <header
      className="border-border/80 bg-background/90 w-full border-b backdrop-blur-xl backdrop-saturate-150"
      aria-busy={isNavigating}
    >
      <div className="px-page flex w-full items-center gap-3 py-2.5">
        <Link
          href="/"
          prefetch
          className="focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2"
          onMouseEnter={() => prefetchTab("/")}
          onClick={() => startNavigation("/")}
        >
          <span
            className={cn(
              "inline-flex shrink-0 will-change-transform",
              dateWobble && "animate-brand-face"
            )}
            style={
              dateWobble
                ? undefined
                : {
                    transform: `rotate(${rotation}deg)`,
                    transition: transition
                      ? "transform 0.78s cubic-bezier(0.22, 1, 0.36, 1)"
                      : "none",
                  }
            }
            aria-hidden
          >
            <BrandMark size={24} />
          </span>
          <span className="truncate text-[19px] font-bold tracking-tight">
            {APP_NAME}
          </span>
        </Link>

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
            "focus-visible:ring-ring flex size-9 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold tracking-tight transition-colors outline-none focus-visible:ring-2",
            profileActive
              ? "border-foreground bg-foreground text-background shadow-app-1"
              : "border-border/80 bg-card text-accent-foreground shadow-app-1 hover:bg-muted/60"
          )}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
