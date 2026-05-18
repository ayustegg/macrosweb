import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";
import { PageFade } from "./page-fade";
import { TabNavigationProvider } from "./tab-navigation-provider";
import { HeaderBrandMotionProvider } from "./header-brand-motion-provider";

/**
 * Chrome compartido de la PWA (vive en app/(app)/layout.tsx).
 * Grid auto / 1fr / auto + 100dvh — patrón MDN sticky footer / PWA móvil.
 * Header y bottom nav en el flujo; un solo scroll en <main>.
 */
export function AppShell({
  children,
  headerInitials,
}: {
  children: React.ReactNode;
  headerInitials: string;
}) {
  return (
    <TabNavigationProvider>
      <HeaderBrandMotionProvider>
        <div className="app-shell bg-background">
          <AppHeader initials={headerInitials} />
          <main className="app-shell-main w-full">
            <PageFade>{children}</PageFade>
          </main>
          <BottomNav />
        </div>
      </HeaderBrandMotionProvider>
    </TabNavigationProvider>
  );
}
