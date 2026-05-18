import { AppShell } from "@/components/layout/app-shell";

/**
 * Layout persistente del área autenticada: header + main + bottom nav
 * no se remontan en cada navegación (App Router).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
