import { AppShell } from "@/components/layout/app-shell";
import { getHeaderInitials } from "@/features/profile/header-initials";

/**
 * Layout persistente del área autenticada: header + main + bottom nav
 * no se remontan en cada navegación (App Router).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerInitials = await getHeaderInitials();

  return <AppShell headerInitials={headerInitials}>{children}</AppShell>;
}
