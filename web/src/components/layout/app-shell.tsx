import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

/**
 * PWA shell: header + scrollable main + tab bar.
 * No fixed nav — avoids double bottom padding on every page.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full max-w-[100dvw] flex-col overflow-hidden bg-background">
      <AppHeader />
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain">
        {children}
      </main>
      <div className="shrink-0 pb-safe">
        <BottomNav />
      </div>
    </div>
  );
}
