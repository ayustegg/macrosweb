import type { ReactNode } from "react";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background px-page pt-safe pb-safe flex min-h-[100dvh] items-center justify-center overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="animate-brand-spin inline-flex" aria-hidden>
            <BrandMark size={40} />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Controla tus macros, alcanza tus metas
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
