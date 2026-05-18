"use client";

import Link from "next/link";
import { HeaderBrandMark } from "@/components/layout/header-brand-mark";
import { APP_NAME } from "@/lib/app-config";
import { useTabNavigation } from "@/components/layout/tab-navigation-provider";

export function AppHeader() {
  const { startNavigation } = useTabNavigation();

  return (
    <header className="border-border/80 bg-background/90 w-full border-b backdrop-blur-xl backdrop-saturate-150">
      <div className="px-page flex w-full items-center gap-2.5 py-2.5">
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2"
          onClick={() => startNavigation("/")}
        >
          <HeaderBrandMark size={24} />
          <span className="text-[19px] font-bold tracking-tight">
            {APP_NAME}
          </span>
        </Link>
      </div>
    </header>
  );
}
