import type { IconName } from "@/lib/icon-names";

export type NavItem = {
  title: string;
  href: string;
  icon: IconName;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: "layoutDashboard" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Institutions", href: "/admin/institutions", icon: "building2" },
      { title: "Programmes", href: "/admin/programs", icon: "clipboardList" },
      { title: "Utilisateurs", href: "/admin/users", icon: "users" },
      { title: "Abonnements", href: "/admin/subscriptions", icon: "creditCard" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Scoring", href: "/admin/scoring", icon: "target" },
      { title: "Logs d'audit", href: "/admin/audit-logs", icon: "scrollText" },
      { title: "Support", href: "/admin/support", icon: "headphones" },
      { title: "Paramètres", href: "/admin/settings", icon: "settings" },
    ],
  },
];

export const institutionNavGroups: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/institution/dashboard",
        icon: "layoutDashboard",
      },
    ],
  },
  {
    label: "Programmes",
    items: [
      { title: "Programmes", href: "/institution/programs", icon: "clipboardList" },
      { title: "Cohortes", href: "/institution/cohorts", icon: "users" },
      { title: "Entreprises", href: "/institution/companies", icon: "briefcase" },
    ],
  },
  {
    label: "Analyse",
    items: [
      { title: "Scores", href: "/institution/scoring", icon: "barChart3" },
      {
        title: "Financement",
        href: "/institution/funding-decisions",
        icon: "handCoins",
      },
      { title: "Rapports", href: "/institution/reports", icon: "fileText" },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Abonnement", href: "/institution/billing", icon: "creditCard" },
      { title: "Paramètres", href: "/institution/settings", icon: "settings" },
    ],
  },
];

export const pmeNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/pme/dashboard", icon: "layoutDashboard" },
      { title: "Profil", href: "/pme/profile", icon: "userCircle" },
      { title: "Diagnostic", href: "/pme/diagnostic", icon: "stethoscope" },
    ],
  },
  {
    label: "Finances",
    items: [
      { title: "Ventes", href: "/pme/sales", icon: "trendingUp" },
      { title: "Dépenses", href: "/pme/expenses", icon: "receipt" },
      { title: "Trésorerie", href: "/pme/treasury", icon: "wallet" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Clients", href: "/pme/customers", icon: "users" },
      { title: "Fournisseurs", href: "/pme/suppliers", icon: "truck" },
      { title: "Employés", href: "/pme/employees", icon: "briefcase" },
      { title: "Documents", href: "/pme/documents", icon: "folderOpen" },
    ],
  },
  {
    label: "Finançabilité",
    items: [
      { title: "Mon score", href: "/pme/score", icon: "lineChart" },
      {
        title: "Recommandations",
        href: "/pme/recommendations",
        icon: "sparkles",
      },
      {
        title: "Demande financement",
        href: "/pme/funding-request",
        icon: "landmark",
      },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Paramètres", href: "/pme/settings", icon: "settings" },
    ],
  },
];

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  SAAS_MANAGER: "Gestionnaire SaaS",
  INSTITUTION_ADMIN: "Admin Institution",
  INSTITUTION_ANALYST: "Analyste",
  PME_OWNER: "Dirigeant PME",
  PME_STAFF: "Collaborateur PME",
  VIEWER: "Lecteur",
};
