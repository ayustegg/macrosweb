import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-dvh flex-col bg-white dark:bg-black"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <main className="flex flex-1 flex-col overflow-y-auto pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
