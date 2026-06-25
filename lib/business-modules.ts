import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  UserCircle,
  Stethoscope,
  TrendingUp,
  Receipt,
  Wallet,
  Users,
  Truck,
  Briefcase,
  FolderOpen,
  LineChart,
  Sparkles,
  Landmark,
  Package,
} from "lucide-react";

export const PME_MODULE_KEYS = [
  "dashboard",
  "profile",
  "diagnostic",
  "sales",
  "expenses",
  "treasury",
  "customers",
  "suppliers",
  "employees",
  "inventory",
  "documents",
  "score",
  "recommendations",
  "funding_request",
] as const;

export type PmeModuleKey = (typeof PME_MODULE_KEYS)[number];

export type BusinessTypeId =
  | "retail_commerce"
  | "services"
  | "manufacturing"
  | "agriculture"
  | "restaurant_hospitality"
  | "technology"
  | "transport_logistics"
  | "construction"
  | "health_wellness"
  | "education_training"
  | "artisan_craft"
  | "other";

export type BusinessTypeConfig = {
  id: BusinessTypeId;
  label: string;
  description: string;
  modules: PmeModuleKey[];
  dependencies: Partial<Record<PmeModuleKey, PmeModuleKey[]>>;
};

export const CORE_PME_MODULES: PmeModuleKey[] = [
  "dashboard",
  "profile",
  "diagnostic",
  "documents",
  "score",
  "recommendations",
  "funding_request",
];

export const PME_MODULE_META: Record<
  PmeModuleKey,
  { title: string; href: string; icon: LucideIcon; group: string }
> = {
  dashboard: { title: "Dashboard", href: "/pme/dashboard", icon: LayoutDashboard, group: "Accueil" },
  profile: { title: "Profil", href: "/pme/profile", icon: UserCircle, group: "Accueil" },
  diagnostic: { title: "Diagnostic", href: "/pme/diagnostic", icon: Stethoscope, group: "Accueil" },
  sales: { title: "Ventes", href: "/pme/sales", icon: TrendingUp, group: "Finances" },
  expenses: { title: "Dépenses", href: "/pme/expenses", icon: Receipt, group: "Finances" },
  treasury: { title: "Trésorerie", href: "/pme/treasury", icon: Wallet, group: "Finances" },
  customers: { title: "Clients", href: "/pme/customers", icon: Users, group: "Gestion" },
  suppliers: { title: "Fournisseurs", href: "/pme/suppliers", icon: Truck, group: "Gestion" },
  employees: { title: "Employés", href: "/pme/employees", icon: Briefcase, group: "Gestion" },
  inventory: { title: "Stocks", href: "/pme/inventory", icon: Package, group: "Gestion" },
  documents: { title: "Documents", href: "/pme/documents", icon: FolderOpen, group: "Gestion" },
  score: { title: "Mon score", href: "/pme/score", icon: LineChart, group: "Finançabilité" },
  recommendations: { title: "Recommandations", href: "/pme/recommendations", icon: Sparkles, group: "Finançabilité" },
  funding_request: { title: "Demande financement", href: "/pme/funding-request", icon: Landmark, group: "Finançabilité" },
};

export const BUSINESS_TYPES: BusinessTypeConfig[] = [
  { id: "retail_commerce", label: "Commerce / Boutique", description: "Vente de produits, stocks et clients.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "suppliers", "inventory", "employees"], dependencies: { treasury: ["sales", "expenses"], inventory: ["sales"] } },
  { id: "services", label: "Services / Conseil", description: "Prestations et suivi clients.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "employees"], dependencies: { treasury: ["sales", "expenses"] } },
  { id: "manufacturing", label: "Production / Industrie", description: "Fabrication et matières premières.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "suppliers", "inventory", "employees"], dependencies: { inventory: ["suppliers"], treasury: ["sales", "expenses"] } },
  { id: "agriculture", label: "Agriculture / Agro", description: "Production agricole et intrants.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "suppliers", "inventory", "employees"], dependencies: { inventory: ["suppliers"] } },
  { id: "restaurant_hospitality", label: "Restauration / Hôtellerie", description: "Service et approvisionnement.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "suppliers", "inventory", "employees"], dependencies: { inventory: ["suppliers"], treasury: ["sales", "expenses"] } },
  { id: "technology", label: "Technologie / Digital", description: "Produits ou services numériques.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "employees"], dependencies: { treasury: ["sales", "expenses"] } },
  { id: "transport_logistics", label: "Transport / Logistique", description: "Flotte et charges opérationnelles.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "suppliers", "employees"], dependencies: { treasury: ["sales", "expenses"] } },
  { id: "construction", label: "BTP / Construction", description: "Chantiers et sous-traitants.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "suppliers", "employees"], dependencies: { treasury: ["sales", "expenses"] } },
  { id: "health_wellness", label: "Santé / Bien-être", description: "Cabinet et équipe.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "employees"], dependencies: { treasury: ["sales", "expenses"] } },
  { id: "education_training", label: "Éducation / Formation", description: "Formations et inscriptions.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "employees"], dependencies: { treasury: ["sales", "expenses"] } },
  { id: "artisan_craft", label: "Artisanat", description: "Production artisanale et ventes.", modules: [...CORE_PME_MODULES, "sales", "expenses", "treasury", "customers", "suppliers", "inventory"], dependencies: { inventory: ["suppliers"] } },
  { id: "other", label: "Autre activité", description: "Tous les modules disponibles.", modules: [...PME_MODULE_KEYS], dependencies: { treasury: ["sales", "expenses"], inventory: ["sales"] } },
];

export function getBusinessTypeConfig(id: BusinessTypeId): BusinessTypeConfig {
  return BUSINESS_TYPES.find((t) => t.id === id) ?? BUSINESS_TYPES.find((t) => t.id === "other")!;
}

export function resolveEnabledModules(businessType: BusinessTypeId) {
  const config = getBusinessTypeConfig(businessType);
  const unique = [...new Set(config.modules)];
  return unique.map((module_key, index) => ({
    module_key,
    required: CORE_PME_MODULES.includes(module_key),
    depends_on: config.dependencies[module_key] ?? [],
    sort_order: index,
  }));
}

export function buildPmeNavFromModules(enabledKeys: PmeModuleKey[]) {
  const groupOrder = ["Accueil", "Finances", "Gestion", "Finançabilité"];
  const groups = new Map<string, PmeModuleKey[]>();
  for (const key of enabledKeys) {
    const meta = PME_MODULE_META[key];
    if (!meta) continue;
    const list = groups.get(meta.group) ?? [];
    list.push(key);
    groups.set(meta.group, list);
  }
  return groupOrder
    .filter((g) => groups.has(g))
    .map((label) => ({
      label: label === "Accueil" ? undefined : label,
      items: (groups.get(label) ?? []).map((key) => {
        const meta = PME_MODULE_META[key];
        return { title: meta.title, href: meta.href, icon: meta.icon };
      }),
    }));
}

export function isModuleEnabled(
  modules: Array<{ module_key: string; enabled: boolean }>,
  key: PmeModuleKey
) {
  return modules.some((m) => m.module_key === key && m.enabled);
}
