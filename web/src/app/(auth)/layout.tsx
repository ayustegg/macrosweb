import type { ReactNode } from "react";
import { BrandMark } from "@/components/features/brand/brand-mark";
import { APP_NAME } from "@/lib/app-config";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-background px-page pt-safe pb-safe">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={40} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Controla tus macros, alcanza tus metas
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
