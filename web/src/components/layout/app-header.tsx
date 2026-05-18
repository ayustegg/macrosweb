import Link from "next/link";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full shrink-0 border-b border-border/80 bg-background/90 pt-safe backdrop-blur-xl backdrop-saturate-150">
      <div className="flex w-full items-center gap-2.5 px-page py-2.5">
        <Link
          href="/today"
          className="flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark size={24} />
          <span className="text-[19px] font-bold tracking-tight">{APP_NAME}</span>
        </Link>
      </div>
    </header>
  );
}
