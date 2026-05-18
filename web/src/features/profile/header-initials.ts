import "server-only";

import { getCurrentUser } from "@/features/auth/queries";
import { getProfile } from "@/features/profile/queries";
import { getInitialsFromName } from "@/lib/user-display";

/** Initials for the header profile avatar. */
export async function getHeaderInitials(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return "?";

  const profile = await getProfile(user.id);
  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "Usuario";

  return getInitialsFromName(displayName);
}
