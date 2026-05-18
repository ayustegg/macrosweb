import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">macrosweb</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Controla tus macros, alcanza tus metas
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
