export const APP_NAME = "Nayooscore";
export const APP_DESCRIPTION =
  "Plateforme de score de finançabilité et d'accompagnement des PME";

export const USER_ROLES = [
  "SUPER_ADMIN",
  "SAAS_MANAGER",
  "INSTITUTION_ADMIN",
  "INSTITUTION_ANALYST",
  "PME_OWNER",
  "PME_STAFF",
  "VIEWER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const INSTITUTION_TYPES = [
  "ministry",
  "ngo",
  "bank",
  "fund",
  "incubator",
  "accelerator",
  "private_company",
] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const SCORE_THRESHOLDS = {
  NOT_READY: { min: 0, max: 39, label: "Non prêt", color: "danger" },
  TO_STRUCTURE: { min: 40, max: 59, label: "À structurer", color: "warning" },
  IN_PROGRESS: { min: 60, max: 74, label: "En progression", color: "info" },
  PRE_FUNDABLE: { min: 75, max: 84, label: "Pré-finançable", color: "success" },
  FUNDABLE: { min: 85, max: 100, label: "Finançable", color: "success" },
} as const;

export const SCORE_WEIGHTS = {
  management: 20,
  financial: 30,
  growth: 20,
  compliance: 15,
  governance: 15,
} as const;

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  SAAS_MANAGER: "/admin/dashboard",
  INSTITUTION_ADMIN: "/institution/dashboard",
  INSTITUTION_ANALYST: "/institution/dashboard",
  PME_OWNER: "/pme/dashboard",
  PME_STAFF: "/pme/dashboard",
  VIEWER: "/pme/dashboard",
};
