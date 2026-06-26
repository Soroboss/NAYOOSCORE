import type { PlanId } from "@/lib/pricing";
import {
  INSTITUTION_PLANS,
  PME_PLANS,
  getInstitutionPlan,
  getPlanPrice,
} from "@/lib/pricing";
import { loadInstitutionPlans, loadPmePlans } from "@/lib/pricing-store";

export type SignupCategory = "pme" | "institution";

export type PmePlanId = "pme_free" | "pme_plus";
export type SignupPlanId = PlanId | PmePlanId;

export const SIGNUP_FLOW_STEPS = [
  { id: "category", label: "Profil" },
  { id: "plan", label: "Forfait" },
  { id: "register", label: "Inscription" },
] as const;

export const SIGNUP_CATEGORIES: {
  id: SignupCategory;
  title: string;
  subtitle: string;
  description: string;
}[] = [
  {
    id: "pme",
    title: "Je suis une PME",
    subtitle: "Entrepreneur / dirigeant",
    description:
      "Structurez votre gestion, calculez votre score et préparez vos demandes de financement.",
  },
  {
    id: "institution",
    title: "Je suis une institution",
    subtitle: "Banque, fonds, incubateur, ONG",
    description:
      "Accompagnez un portefeuille de PME, pilotez vos programmes et analysez les scores.",
  },
];

const PME_PLAN_IDS: PmePlanId[] = ["pme_free", "pme_plus"];
const INSTITUTION_PLAN_IDS: PlanId[] = ["starter", "pro", "enterprise"];

export function isSignupCategory(value: string | undefined): value is SignupCategory {
  return value === "pme" || value === "institution";
}

export function isValidPlanForCategory(
  category: SignupCategory,
  plan: string | undefined
): plan is SignupPlanId {
  if (!plan) return false;
  if (category === "pme") return PME_PLAN_IDS.includes(plan as PmePlanId);
  return INSTITUTION_PLAN_IDS.includes(plan as PlanId);
}

export async function isValidPlanForCategoryAsync(
  category: SignupCategory,
  plan: string | undefined
): Promise<boolean> {
  if (!plan) return false;
  const plans =
    category === "pme" ? await loadPmePlans() : await loadInstitutionPlans();
  return plans.some((p) => p.id === plan);
}

export async function getPlansForCategoryAsync(category: SignupCategory) {
  return category === "pme" ? loadPmePlans() : loadInstitutionPlans();
}

export function getPlansForCategory(category: SignupCategory) {
  return category === "pme" ? PME_PLANS : INSTITUTION_PLANS;
}

export function getPlanLabel(category: SignupCategory, planId: string): string {
  if (category === "pme") {
    return PME_PLANS.find((p) => p.id === planId)?.name ?? planId;
  }
  return getInstitutionPlan(planId)?.name ?? planId;
}

export function getPlanMonthlyPrice(category: SignupCategory, planId: string): number {
  if (category === "pme") {
    return PME_PLANS.find((p) => p.id === planId)?.monthlyPrice ?? 0;
  }
  return getPlanPrice(planId);
}

export function signupPlansPath(category: SignupCategory): string {
  return `/signup/plans?category=${category}`;
}

export function registerPath(category: SignupCategory, plan: SignupPlanId): string {
  return `/register?category=${category}&plan=${plan}`;
}

export function getCategoryTitle(category: SignupCategory): string {
  return category === "pme" ? "PME" : "Institution";
}
