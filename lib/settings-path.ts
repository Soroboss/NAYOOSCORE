import type { UserRole } from "@/lib/constants";
import { canAccessAdmin, canAccessInstitution } from "@/lib/permissions";

export function getSettingsPath(role: UserRole): string {
  if (canAccessAdmin(role)) return "/admin/settings";
  if (canAccessInstitution(role)) return "/institution/settings";
  return "/pme/settings";
}

export function getDashboardPath(role: UserRole): string {
  if (canAccessAdmin(role)) return "/admin/dashboard";
  if (canAccessInstitution(role)) return "/institution/dashboard";
  return "/pme/dashboard";
}
