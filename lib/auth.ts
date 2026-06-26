import { redirect } from "next/navigation";
import { ROLE_REDIRECTS, type UserRole } from "@/lib/constants";
import {
  getAccessToken,
  isEmailVerifiedCookie,
  setEmailVerifiedCookie,
} from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import { getCompanyForUser } from "@/lib/company-context";
import {
  getProfileByUserId,
  refreshSessionIfNeeded,
} from "@/lib/profiles";
import {
  canAccessAdmin,
  canAccessInstitution,
  canAccessPme,
  canAccessPath,
} from "@/lib/permissions";
import { getUserDisplayName } from "@/lib/user-display";
import type { User } from "@/types/user";

export type AuthSession = {
  user: User;
  accessToken: string;
};

export async function getEmailVerifiedFromAuth(accessToken: string): Promise<boolean> {
  const client = createInsforgeServerClient(accessToken);
  const { data } = await client.auth.getCurrentUser();
  return data?.user?.emailVerified ?? false;
}

/** À appeler uniquement depuis Server Actions / Route Handlers (écrit un cookie). */
export async function syncEmailVerifiedFromAuth(accessToken: string): Promise<boolean> {
  const verified = await getEmailVerifiedFromAuth(accessToken);
  await setEmailVerifiedCookie(verified);
  return verified;
}

export async function requireVerifiedEmail(redirectPath?: string) {
  const accessToken = (await refreshSessionIfNeeded()) ?? (await getAccessToken());
  if (!accessToken) {
    redirect("/login");
  }

  const verifiedFromCookie = await isEmailVerifiedCookie();
  const verified = verifiedFromCookie || (await getEmailVerifiedFromAuth(accessToken));

  if (!verified) {
    const url = redirectPath
      ? `/verify-email?redirect=${encodeURIComponent(redirectPath)}`
      : "/verify-email";
    redirect(url);
  }
}

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

export async function getLoginRedirectForUser(user: User): Promise<string> {
  if (canAccessPme(user.role)) {
    return getPmeRedirectPath(user.id);
  }
  return getRedirectPathForRole(user.role);
}

export async function getPmeRedirectPath(userId: string): Promise<string> {
  const company = await getCompanyForUser(userId);
  if (!company || !company.onboarding_completed) {
    return "/pme/onboarding";
  }
  return "/pme/dashboard";
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin") && !canAccessAdmin(role)) return false;
  if (pathname.startsWith("/institution") && !canAccessInstitution(role)) return false;
  if (pathname.startsWith("/pme") && !canAccessPme(role)) return false;
  return canAccessPath(role, pathname);
}
