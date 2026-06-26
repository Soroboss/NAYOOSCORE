import type { UserRole } from "@/lib/constants";
import type { NavGroup } from "@/lib/nav-config";

export type Permission =
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
  | "subscriptions:write"
  | "settings:read"
  | "settings:write"
  | "collaborators:read"
  | "collaborators:write"
  | "billing:read"
  | "finances:read"
  | "finances:write"
  | "operations:read"
  | "operations:write"
  | "funding_request:write";

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
    "settings:read",
    "settings:write",
    "collaborators:read",
    "collaborators:write",
    "billing:read",
    "finances:read",
    "finances:write",
    "operations:read",
    "operations:write",
    "funding_request:write",
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
    "settings:read",
    "collaborators:read",
    "collaborators:write",
  ],
  SAAS_SUPPORT: [
    "institutions:read",
    "programs:read",
    "users:read",
    "audit:read",
    "settings:read",
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
    "billing:read",
    "settings:read",
    "settings:write",
    "collaborators:read",
    "collaborators:write",
  ],
  INSTITUTION_ANALYST: [
    "programs:read",
    "companies:read",
    "scores:read",
    "funding:read",
    "reports:read",
    "settings:read",
  ],
  INSTITUTION_VIEWER: [
    "programs:read",
    "companies:read",
    "scores:read",
    "settings:read",
  ],
  PME_OWNER: [
    "companies:read",
    "companies:write",
    "scores:read",
    "funding:read",
    "funding_request:write",
    "finances:read",
    "finances:write",
    "operations:read",
    "operations:write",
    "settings:read",
    "settings:write",
    "collaborators:read",
    "collaborators:write",
  ],
  PME_STAFF: [
    "companies:read",
    "companies:write",
    "scores:read",
    "finances:read",
    "finances:write",
    "operations:read",
    "operations:write",
    "settings:read",
  ],
  PME_ACCOUNTANT: [
    "companies:read",
    "finances:read",
    "finances:write",
    "settings:read",
  ],
  VIEWER: ["companies:read", "scores:read", "settings:read"],
};

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/admin/dashboard": "institutions:read",
  "/admin/institutions": "institutions:read",
  "/admin/programs": "programs:read",
  "/admin/users": "users:read",
  "/admin/subscriptions": "subscriptions:read",
  "/admin/scoring": "scores:write",
  "/admin/audit-logs": "audit:read",
  "/admin/support": "users:read",
  "/admin/settings": "settings:read",
  "/institution/dashboard": "programs:read",
  "/institution/programs": "programs:read",
  "/institution/cohorts": "programs:read",
  "/institution/companies": "companies:read",
  "/institution/scoring": "scores:read",
  "/institution/funding-decisions": "funding:read",
  "/institution/reports": "reports:read",
  "/institution/billing": "billing:read",
  "/institution/settings": "settings:read",
  "/pme/dashboard": "companies:read",
  "/pme/profile": "companies:read",
  "/pme/diagnostic": "companies:write",
  "/pme/sales": "finances:read",
  "/pme/expenses": "finances:read",
  "/pme/treasury": "finances:read",
  "/pme/customers": "operations:read",
  "/pme/suppliers": "operations:read",
  "/pme/employees": "operations:read",
  "/pme/documents": "operations:read",
  "/pme/inventory": "operations:read",
  "/pme/marketing": "operations:read",
  "/pme/field-ops": "operations:read",
  "/pme/score": "scores:read",
  "/pme/recommendations": "scores:read",
  "/pme/funding-request": "funding_request:write",
  "/pme/settings": "settings:read",
};

const PME_FINANCE_ROUTES = ["/pme/sales", "/pme/expenses", "/pme/treasury"];
const PME_OPERATION_ROUTES = [
  "/pme/customers",
  "/pme/suppliers",
  "/pme/employees",
  "/pme/documents",
  "/pme/inventory",
  "/pme/marketing",
  "/pme/field-ops",
  "/pme/diagnostic",
];
const PME_READONLY_ALLOWED = [
  "/pme/dashboard",
  "/pme/profile",
  "/pme/score",
  "/pme/settings",
];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "SAAS_MANAGER" || role === "SAAS_SUPPORT";
}

export function canAccessInstitution(role: UserRole): boolean {
  return (
    role === "INSTITUTION_ADMIN" ||
    role === "INSTITUTION_ANALYST" ||
    role === "INSTITUTION_VIEWER"
  );
}

export function canAccessPme(role: UserRole): boolean {
  return (
    role === "PME_OWNER" ||
    role === "PME_STAFF" ||
    role === "PME_ACCOUNTANT" ||
    role === "VIEWER"
  );
}

export function resolveInstitutionRole(
  profileRole: UserRole,
  memberRole: string
): UserRole {
  if (profileRole === "SUPER_ADMIN") return profileRole;
  const allowed: UserRole[] = [
    "INSTITUTION_ADMIN",
    "INSTITUTION_ANALYST",
    "INSTITUTION_VIEWER",
  ];
  if (allowed.includes(memberRole as UserRole)) return memberRole as UserRole;
  return profileRole;
}

export function resolvePmeRole(profileRole: UserRole, memberRole?: string): UserRole {
  if (memberRole === "PME_OWNER" || memberRole === "OWNER") return "PME_OWNER";
  const allowed: UserRole[] = ["PME_STAFF", "PME_ACCOUNTANT", "VIEWER"];
  if (memberRole && allowed.includes(memberRole as UserRole)) {
    return memberRole as UserRole;
  }
  return profileRole;
}

export function canManageInstitutionPrograms(
  role: UserRole,
  memberRole: string
): boolean {
  const effective = resolveInstitutionRole(role, memberRole);
  return role === "SUPER_ADMIN" || hasPermission(effective, "programs:write");
}

export function canManageCollaborators(role: UserRole): boolean {
  return hasPermission(role, "collaborators:write");
}

export function canManagePricingPlans(role: UserRole): boolean {
  return hasPermission(role, "subscriptions:write");
}

export function getPricingPlanRestrictionMessage(role: UserRole): string | null {
  if (canManagePricingPlans(role)) return null;
  if (role === "SAAS_SUPPORT") {
    return "Rôle support : consultation des tarifs uniquement, modification interdite.";
  }
  return "Permission « abonnements : écriture » requise pour modifier les offres.";
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/admin")) {
    if (!canAccessAdmin(role)) return false;
  } else if (pathname.startsWith("/institution")) {
    if (!canAccessInstitution(role)) return false;
  } else if (pathname.startsWith("/pme")) {
    if (!canAccessPme(role)) return false;
    if (role === "VIEWER") {
      return PME_READONLY_ALLOWED.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );
    }
    if (role === "PME_ACCOUNTANT") {
      const allowed = [
        "/pme/dashboard",
        "/pme/profile",
        "/pme/settings",
        ...PME_FINANCE_ROUTES,
      ];
      return allowed.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );
    }
  }

  const basePath = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  if (!basePath) return true;

  const permission = ROUTE_PERMISSIONS[basePath];
  return hasPermission(role, permission);
}

export function filterNavGroups(navGroups: NavGroup[], role: UserRole): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessPath(role, item.href)),
    }))
    .filter((group) => group.items.length > 0);
}

export function isPmeRouteAllowed(role: UserRole, href: string): boolean {
  return canAccessPath(role, href);
}

export { PME_FINANCE_ROUTES, PME_OPERATION_ROUTES, PME_READONLY_ALLOWED };
