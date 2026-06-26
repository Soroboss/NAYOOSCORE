/**
 * Modèle tarifaire Nayooscore (B2B2C)
 *
 * Qui paie ?
 * - Les INSTITUTIONS (banques, fonds, incubateurs) : client SaaS principal.
 * - Les PME rattachées à une institution : incluses dans l'abonnement institution.
 * - Les PME en inscription directe (sans institution) : offre gratuite limitée ;
 *   option PME Plus pour les fonctionnalités avancées.
 */

export type PlanId = "starter" | "pro" | "enterprise";

export type InstitutionPlan = {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: {
    maxPme: number | null;
    maxPrograms: number | null;
    maxUsers: number | null;
  };
  features: string[];
  highlighted?: boolean;
};

export type PmePlan = {
  id: "pme_free" | "pme_plus";
  name: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  forWhom: string;
};

export const INSTITUTION_PLANS: InstitutionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Pour un premier programme pilote ou une petite structure.",
    monthlyPrice: 49_000,
    yearlyPrice: 470_400,
    limits: { maxPme: 25, maxPrograms: 1, maxUsers: 2 },
    features: [
      "Jusqu'à 25 PME accompagnées",
      "1 programme actif",
      "2 utilisateurs institution",
      "Scoring et rapports de base",
      "Support email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les institutions qui accompagnent un portefeuille actif.",
    monthlyPrice: 149_000,
    yearlyPrice: 1_430_400,
    limits: { maxPme: 150, maxPrograms: 5, maxUsers: 10 },
    features: [
      "Jusqu'à 150 PME",
      "5 programmes actifs",
      "10 utilisateurs",
      "Décisions de financement",
      "Exports et rapports avancés",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Pour les grands réseaux, banques et programmes nationaux.",
    monthlyPrice: 399_000,
    yearlyPrice: 3_830_400,
    limits: { maxPme: null, maxPrograms: null, maxUsers: null },
    features: [
      "PME et programmes illimités",
      "Utilisateurs illimités",
      "API et intégrations",
      "SLA dédié",
      "Account manager",
      "Personnalisation scoring",
    ],
  },
];

export const PME_PLANS: PmePlan[] = [
  {
    id: "pme_free",
    name: "PME Gratuit",
    description: "Inscription directe sans institution partenaire.",
    monthlyPrice: 0,
    forWhom: "Entrepreneurs autonomes",
    features: [
      "Profil et diagnostic",
      "Score de base",
      "Modules essentiels (ventes, dépenses)",
      "Recommandations IA limitées",
    ],
  },
  {
    id: "pme_plus",
    name: "PME Plus",
    description: "Pour les PME sans institution mais souhaitant aller plus loin.",
    monthlyPrice: 9_900,
    forWhom: "PME en croissance autonome",
    features: [
      "Tous les modules métier",
      "Recommandations IA complètes",
      "Demande de financement",
      "Documents et trésorerie avancée",
    ],
  },
];

export const BILLING_MODEL = {
  headline: "Les institutions paient, les PME accompagnées sont incluses",
  summary:
    "Nayooscore est un SaaS B2B2C : la facturation principale est à la charge des institutions partenaires. Les PME qu'elles accompagnent accèdent gratuitement à la plateforme dans les limites du plan souscrit.",
  institutionPays: [
    "Abonnement mensuel ou annuel selon le plan",
    "Facturation au nombre de PME et programmes",
    "Renouvellement et upgrade gérés par l'admin SaaS",
  ],
  pmeIncluded: [
    "PME rattachée à une institution = 0 FCFA pour la PME",
    "Accès selon les quotas du plan institution",
    "Pas de double facturation",
  ],
  pmeDirect: [
    "Inscription sans institution = offre gratuite limitée",
    "PME Plus optionnelle pour les fonctionnalités avancées",
  ],
} as const;

export function getInstitutionPlan(planId: string): InstitutionPlan | undefined {
  return INSTITUTION_PLANS.find((p) => p.id === planId);
}

export function getPlanPrice(planId: string): number {
  return getInstitutionPlan(planId)?.monthlyPrice ?? 0;
}

export function isWithinLimit(
  current: number,
  max: number | null
): { ok: boolean; percent: number } {
  if (max === null) return { ok: true, percent: 0 };
  const percent = Math.min(100, Math.round((current / max) * 100));
  return { ok: current <= max, percent };
}
