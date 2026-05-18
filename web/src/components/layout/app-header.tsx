import Link from "next/link";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";

export function AppHeader() {
  return (
    <header className="border-border/80 bg-background/90 w-full border-b backdrop-blur-xl backdrop-saturate-150">
      <div className="px-page flex w-full items-center gap-2.5 py-2.5">
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2"
        >
          <BrandMark size={24} />
          <span className="text-[19px] font-bold tracking-tight">
            {APP_NAME}
          </span>
        </Link>
      </div>
    </header>
  );
}
