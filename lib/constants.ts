export const APP_NAME = "Nayooscore";
export const APP_TAGLINE = "Le score qui inspire confiance";
export const APP_DESCRIPTION =
  "Plateforme de score de finançabilité et d'accompagnement des PME";

export const CONTACT = {
  phone: "+225 07 57 22 87 31",
  phoneHref: "tel:+2250757228731",
  whatsapp: "+225 01 00 57 65 26",
  whatsappHref: "https://wa.me/2250100576526",
} as const;

export const BRAND_COLORS = {
  navy: "#0B1D2A",
  darkBlue: "#132B49",
  mediumBlue: "#0077B6",
  teal: "#00BFA6",
  background: "#F5F7FA",
} as const;

export const USER_ROLES = [
  "SUPER_ADMIN",
  "SAAS_MANAGER",
  "SAAS_SUPPORT",
  "INSTITUTION_ADMIN",
  "INSTITUTION_ANALYST",
  "INSTITUTION_VIEWER",
  "PME_OWNER",
  "PME_STAFF",
  "PME_ACCOUNTANT",
  "VIEWER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Rôles de l'équipe SaaS (admin plateforme) — distincts des comptes institution / PME */
export const PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "SAAS_MANAGER",
  "SAAS_SUPPORT",
] as const satisfies readonly UserRole[];

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
  SAAS_SUPPORT: "/admin/dashboard",
  INSTITUTION_ADMIN: "/institution/dashboard",
  INSTITUTION_ANALYST: "/institution/dashboard",
  INSTITUTION_VIEWER: "/institution/dashboard",
  PME_OWNER: "/pme/dashboard",
  PME_STAFF: "/pme/dashboard",
  PME_ACCOUNTANT: "/pme/dashboard",
  VIEWER: "/pme/dashboard",
};
