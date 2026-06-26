import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  HandCoins,
  Headphones,
  LayoutDashboard,
  LineChart,
  ScrollText,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Briefcase,
  UserCircle,
  Stethoscope,
  Receipt,
  Landmark,
  Truck,
  FolderOpen,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Institutions", href: "/admin/institutions", icon: Building2 },
      { title: "Programmes", href: "/admin/programs", icon: ClipboardList },
      { title: "Utilisateurs", href: "/admin/users", icon: Users },
      { title: "Abonnements", href: "/admin/subscriptions", icon: CreditCard },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Scoring", href: "/admin/scoring", icon: Target },
      { title: "Logs d'audit", href: "/admin/audit-logs", icon: ScrollText },
      { title: "Support", href: "/admin/support", icon: Headphones },
    ],
  },
];

export const institutionNavGroups: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/institution/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Programmes",
    items: [
      { title: "Programmes", href: "/institution/programs", icon: ClipboardList },
      { title: "Cohortes", href: "/institution/cohorts", icon: Users },
      { title: "Entreprises", href: "/institution/companies", icon: Briefcase },
    ],
  },
  {
    label: "Analyse",
    items: [
      { title: "Scores", href: "/institution/scoring", icon: BarChart3 },
      {
        title: "Financement",
        href: "/institution/funding-decisions",
        icon: HandCoins,
      },
      { title: "Rapports", href: "/institution/reports", icon: FileText },
    ],
  },
  {
    label: "Compte",
    items: [
      { title: "Abonnement", href: "/institution/billing", icon: CreditCard },
    ],
  },
];

export const pmeNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/pme/dashboard", icon: LayoutDashboard },
      { title: "Profil", href: "/pme/profile", icon: UserCircle },
      { title: "Diagnostic", href: "/pme/diagnostic", icon: Stethoscope },
    ],
  },
  {
    label: "Finances",
    items: [
      { title: "Ventes", href: "/pme/sales", icon: TrendingUp },
      { title: "Dépenses", href: "/pme/expenses", icon: Receipt },
      { title: "Trésorerie", href: "/pme/treasury", icon: Wallet },
    ],
  },
  {
    label: "Gestion",
    items: [
      { title: "Clients", href: "/pme/customers", icon: Users },
      { title: "Fournisseurs", href: "/pme/suppliers", icon: Truck },
      { title: "Employés", href: "/pme/employees", icon: Briefcase },
      { title: "Documents", href: "/pme/documents", icon: FolderOpen },
    ],
  },
  {
    label: "Finançabilité",
    items: [
      { title: "Mon score", href: "/pme/score", icon: LineChart },
      {
        title: "Recommandations",
        href: "/pme/recommendations",
        icon: Sparkles,
      },
      {
        title: "Demande financement",
        href: "/pme/funding-request",
        icon: Landmark,
      },
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
