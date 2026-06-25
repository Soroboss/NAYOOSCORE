"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/app/actions/auth";
import { BUSINESS_TYPES, type BusinessTypeId } from "@/lib/business-modules";
import {
  createCompanyWithModules,
  getCompanyForUser,
} from "@/lib/company-context";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { canAccessPme } from "@/lib/permissions";

const businessTypeIds = BUSINESS_TYPES.map((t) => t.id) as [BusinessTypeId, ...BusinessTypeId[]];

const onboardingSchema = z.object({
  business_type: z.enum(businessTypeIds),
  name: z.string().min(2, "Nom requis"),
  sector: z.string().min(2, "Secteur requis"),
  legal_status: z.string().min(2, "Statut juridique requis"),
  country: z.string().min(2, "Pays requis"),
  city: z.string().min(2, "Ville requise"),
  owner_name: z.string().min(2, "Nom du dirigeant requis"),
  phone: z.string().min(6, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  rccm: z.string().optional(),
  tax_id: z.string().optional(),
});

export type CompanyActionState = { success: boolean; error?: string; message?: string };

export async function requirePmeCompany() {
  const user = await requireAuth(canAccessPme);
  const company = await getCompanyForUser(user.id);
  if (!company) redirect("/pme/onboarding");
  if (!company.onboarding_completed) redirect("/pme/onboarding");
  return { user, company };
}

export async function completeOnboardingAction(
  _prev: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  const user = await requireAuth(canAccessPme);
  const existing = await getCompanyForUser(user.id);
  if (existing?.onboarding_completed) {
    redirect("/pme/dashboard");
  }

  const parsed = onboardingSchema.safeParse({
    business_type: formData.get("business_type"),
    name: formData.get("name"),
    sector: formData.get("sector"),
    legal_status: formData.get("legal_status"),
    country: formData.get("country"),
    city: formData.get("city"),
    owner_name: formData.get("owner_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    rccm: formData.get("rccm") || undefined,
    tax_id: formData.get("tax_id") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  try {
    await createCompanyWithModules(user.id, parsed.data);
    redirect("/pme/dashboard");
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur lors de la création.",
    };
  }
}

const profileSchema = z.object({
  name: z.string().min(2),
  sector: z.string().min(2),
  legal_status: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(2),
  owner_name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  rccm: z.string().optional(),
  tax_id: z.string().optional(),
});

export async function updateCompanyProfileAction(
  _prev: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  const { company } = await requirePmeCompany();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    sector: formData.get("sector"),
    legal_status: formData.get("legal_status"),
    country: formData.get("country"),
    city: formData.get("city"),
    owner_name: formData.get("owner_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    rccm: formData.get("rccm") || undefined,
    tax_id: formData.get("tax_id") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database
    .from("companies")
    .update(parsed.data)
    .eq("id", company.id);

  if (error) return { success: false, error: error.message };
  return { success: true, message: "Profil mis à jour." };
}

const diagnosticSchema = z.object({
  years_in_business: z.coerce.number().min(0).max(100),
  employee_count: z.coerce.number().min(0).max(10000),
  monthly_revenue_estimate: z.coerce.number().min(0),
  has_accounting: z.enum(["yes", "no"]),
  has_bank_account: z.enum(["yes", "no"]),
  main_challenge: z.string().min(10),
});

export async function saveDiagnosticAction(
  _prev: CompanyActionState,
  formData: FormData
): Promise<CompanyActionState> {
  const { company } = await requirePmeCompany();
  const parsed = diagnosticSchema.safeParse({
    years_in_business: formData.get("years_in_business"),
    employee_count: formData.get("employee_count"),
    monthly_revenue_estimate: formData.get("monthly_revenue_estimate"),
    has_accounting: formData.get("has_accounting"),
    has_bank_account: formData.get("has_bank_account"),
    main_challenge: formData.get("main_challenge"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { data: existing } = await client.database
    .from("diagnostics")
    .select("id")
    .eq("company_id", company.id)
    .maybeSingle();

  const responses = {
    years_in_business: parsed.data.years_in_business,
    employee_count: parsed.data.employee_count,
    monthly_revenue_estimate: parsed.data.monthly_revenue_estimate,
    has_accounting: parsed.data.has_accounting === "yes",
    has_bank_account: parsed.data.has_bank_account === "yes",
    main_challenge: parsed.data.main_challenge,
  };

  const payload = {
    company_id: company.id,
    responses,
    completed_at: new Date().toISOString(),
  };

  const { error } = existing
    ? await client.database.from("diagnostics").update(payload).eq("id", existing.id)
    : await client.database.from("diagnostics").insert(payload);

  if (error) return { success: false, error: error.message };
  return { success: true, message: "Diagnostic enregistré." };
}
