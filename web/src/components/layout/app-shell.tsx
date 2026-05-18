import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

/**
 * PWA shell: header + scrollable main + tab bar.
 * Fixed tab bar sits flush on the screen bottom (safe-area via pb-safe on nav).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-[100dvh] w-full max-w-[100dvw] flex-col overflow-hidden">
      <AppHeader />
      <main className="pb-nav flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
