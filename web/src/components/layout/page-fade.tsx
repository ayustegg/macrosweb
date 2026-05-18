"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { CONTENT_FADE_IN } from "@/lib/content-fade";
import { cn } from "@/lib/utils";

/** Fade-in when route segment changes (tab / page navigation). */
export function PageFade({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn(CONTENT_FADE_IN, "min-h-0", className)}>
      {children}
    </div>
  );
}
