import {
  INSTITUTION_PLANS,
  PME_PLANS,
  type InstitutionPlan,
  type PmePlan,
} from "@/lib/pricing";
import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge-server";

type PricingPlanRow = {
  id: string;
  category: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number | null;
  max_pme: number | null;
  max_programs: number | null;
  max_users: number | null;
  for_whom: string | null;
  features: string[] | unknown;
  highlighted: boolean;
  active: boolean;
  sort_order: number;
};

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((f): f is string => typeof f === "string");
  }
  return [];
}

function rowToInstitutionPlan(row: PricingPlanRow): InstitutionPlan {
  return {
    id: row.id as InstitutionPlan["id"],
    name: row.name,
    description: row.description,
    monthlyPrice: Number(row.monthly_price),
    yearlyPrice: row.yearly_price != null ? Number(row.yearly_price) : 0,
    limits: {
      maxPme: row.max_pme,
      maxPrograms: row.max_programs,
      maxUsers: row.max_users,
    },
    features: parseFeatures(row.features),
    highlighted: row.highlighted,
  };
}

function rowToPmePlan(row: PricingPlanRow): PmePlan {
  return {
    id: row.id as PmePlan["id"],
    name: row.name,
    description: row.description,
    monthlyPrice: Number(row.monthly_price),
    forWhom: row.for_whom ?? "",
    features: parseFeatures(row.features),
  };
}

async function fetchPlanRows(includeInactive = false): Promise<PricingPlanRow[]> {
  try {
    const client = includeInactive
      ? createInsforgeAdminClient()
      : createInsforgeServerClient();

    let query = client.database
      .from("pricing_plans")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!includeInactive) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;
    if (error || !data?.length) return [];
    return data as PricingPlanRow[];
  } catch {
    return [];
  }
}

export async function loadInstitutionPlans(
  includeInactive = false
): Promise<InstitutionPlan[]> {
  const rows = await fetchPlanRows(includeInactive);
  const institution = rows
    .filter((r) => r.category === "institution")
    .map(rowToInstitutionPlan);
  return institution.length > 0 ? institution : INSTITUTION_PLANS;
}

export async function loadPmePlans(includeInactive = false): Promise<PmePlan[]> {
  const rows = await fetchPlanRows(includeInactive);
  const pme = rows.filter((r) => r.category === "pme").map(rowToPmePlan);
  return pme.length > 0 ? pme : PME_PLANS;
}

export async function loadAllPricingPlans(includeInactive = false) {
  const rows = await fetchPlanRows(includeInactive);
  if (rows.length === 0) {
    return {
      institution: INSTITUTION_PLANS,
      pme: PME_PLANS,
      raw: [] as PricingPlanRow[],
    };
  }
  return {
    institution: rows.filter((r) => r.category === "institution").map(rowToInstitutionPlan),
    pme: rows.filter((r) => r.category === "pme").map(rowToPmePlan),
    raw: rows,
  };
}

export type PricingPlanAdminRow = PricingPlanRow;
