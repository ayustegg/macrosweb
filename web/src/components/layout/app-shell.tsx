import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";
import { TabNavigationProvider } from "./tab-navigation-provider";

/**
 * Chrome compartido de la PWA (vive en app/(app)/layout.tsx).
 * Grid auto / 1fr / auto + 100dvh — patrón MDN sticky footer / PWA móvil.
 * Header y bottom nav en el flujo; un solo scroll en <main>.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TabNavigationProvider>
      <div className="app-shell bg-background">
        <AppHeader />
        <main className="app-shell-main w-full">{children}</main>
        <BottomNav />
      </div>
    </TabNavigationProvider>
  );
}
