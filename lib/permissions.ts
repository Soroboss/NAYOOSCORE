import type { UserRole } from "@/lib/constants";

type Permission =
  | "institutions:read"
  | "institutions:write"
  | "programs:read"
  | "programs:write"
  | "companies:read"
  | "companies:write"
  | "scores:read"
  | "scores:write"
  | "funding:read"
  | "funding:write"
  | "reports:read"
  | "reports:export"
  | "users:read"
  | "users:write"
  | "audit:read"
  | "subscriptions:read"
  | "subscriptions:write";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "institutions:read",
    "institutions:write",
    "programs:read",
    "programs:write",
    "companies:read",
    "companies:write",
    "scores:read",
    "scores:write",
    "funding:read",
    "funding:write",
    "reports:read",
    "reports:export",
    "users:read",
    "users:write",
    "audit:read",
    "subscriptions:read",
    "subscriptions:write",
  ],
  SAAS_MANAGER: [
    "institutions:read",
    "institutions:write",
    "programs:read",
    "users:read",
    "users:write",
    "audit:read",
    "subscriptions:read",
    "subscriptions:write",
  ],
  INSTITUTION_ADMIN: [
    "programs:read",
    "programs:write",
    "companies:read",
    "companies:write",
    "scores:read",
    "funding:read",
    "funding:write",
    "reports:read",
    "reports:export",
  ],
  INSTITUTION_ANALYST: [
    "programs:read",
    "companies:read",
    "scores:read",
    "funding:read",
    "reports:read",
  ],
  PME_OWNER: [
    "companies:read",
    "companies:write",
    "scores:read",
    "funding:read",
    "funding:write",
  ],
  PME_STAFF: ["companies:read", "companies:write", "scores:read"],
  VIEWER: ["companies:read", "scores:read"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "SAAS_MANAGER";
}

export function canAccessInstitution(role: UserRole): boolean {
  return role === "INSTITUTION_ADMIN" || role === "INSTITUTION_ANALYST";
}

export function canAccessPme(role: UserRole): boolean {
  return role === "PME_OWNER" || role === "PME_STAFF" || role === "VIEWER";
}

export function canManageInstitutionPrograms(
  role: UserRole,
  memberRole: string
): boolean {
  return role === "SUPER_ADMIN" || memberRole === "INSTITUTION_ADMIN";
}
