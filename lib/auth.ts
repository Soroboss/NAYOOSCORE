import { ROLE_REDIRECTS, type UserRole } from "@/lib/constants";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import {
  getProfileByUserId,
  refreshSessionIfNeeded,
} from "@/lib/profiles";
import {
  canAccessAdmin,
  canAccessInstitution,
  canAccessPme,
} from "@/lib/permissions";
import { getUserDisplayName } from "@/lib/user-display";
import type { User } from "@/types/user";

export type AuthSession = {
  user: User;
  accessToken: string;
};

export async function getCurrentUser(): Promise<User | null> {
  const accessToken = (await refreshSessionIfNeeded()) ?? (await getAccessToken());
  if (!accessToken) return null;

  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.auth.getCurrentUser();

  if (error || !data?.user) return null;

  const profile = await getProfileByUserId(data.user.id);
  if (profile) return profile;

  return {
    id: data.user.id,
    full_name: getUserDisplayName(data.user),
    email: data.user.email,
    phone: null,
    role: "PME_OWNER",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const accessToken = (await refreshSessionIfNeeded()) ?? (await getAccessToken());
  if (!accessToken) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  return { user, accessToken };
}

export function getRedirectPathForRole(role: UserRole): string {
  return ROLE_REDIRECTS[role] ?? "/login";
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) return canAccessAdmin(role);
  if (pathname.startsWith("/institution")) return canAccessInstitution(role);
  if (pathname.startsWith("/pme")) return canAccessPme(role);
  return true;
}
