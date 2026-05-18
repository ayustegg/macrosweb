import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      <main className="flex flex-1 flex-col pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
