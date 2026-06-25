import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import {
  type BusinessTypeId,
  resolveEnabledModules,
} from "@/lib/business-modules";
import type { Company } from "@/types/company";
import type { CompanyModule } from "@/types/modules";

export type CompanyWithModules = Company & { modules: CompanyModule[] };

export async function getCompanyForUser(
  userId: string,
  accessToken?: string
): Promise<CompanyWithModules | null> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return null;

  const client = createInsforgeServerClient(token);
  const { data: links } = await client.database
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1);

  const companyId = links?.[0]?.company_id;
  if (!companyId) return null;

  const { data: company } = await client.database
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (!company) return null;

  const { data: modules } = await client.database
    .from("company_modules")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order", { ascending: true });

  return { ...(company as Company), modules: (modules ?? []) as CompanyModule[] };
}

export async function createCompanyWithModules(
  userId: string,
  input: {
    name: string;
    sector: string;
    legal_status: string;
    business_type: BusinessTypeId;
    country: string;
    city: string;
    owner_name: string;
    phone: string;
    email: string;
    rccm?: string;
    tax_id?: string;
  },
  accessToken?: string
) {
  const token = accessToken ?? (await getAccessToken());
  if (!token) throw new Error("Session expirée.");

  const client = createInsforgeServerClient(token);
  const moduleDefs = resolveEnabledModules(input.business_type);

  const { data: company, error: companyError } = await client.database
    .from("companies")
    .insert({
      name: input.name,
      sector: input.sector,
      legal_status: input.legal_status,
      business_type: input.business_type,
      country: input.country,
      city: input.city,
      owner_name: input.owner_name,
      phone: input.phone,
      email: input.email,
      rccm: input.rccm ?? null,
      tax_id: input.tax_id ?? null,
      onboarding_completed: true,
      institution_id: null,
      program_id: null,
    })
    .select("*")
    .single();

  if (companyError || !company) {
    throw new Error(companyError?.message ?? "Création entreprise impossible.");
  }

  const { error: linkError } = await client.database.from("company_users").insert({
    company_id: company.id,
    user_id: userId,
    role: "OWNER",
  });

  if (linkError) throw new Error(linkError.message);

  const { error: modulesError } = await client.database.from("company_modules").insert(
    moduleDefs.map((m) => ({
      company_id: company.id,
      module_key: m.module_key,
      enabled: true,
      required: m.required,
      depends_on: m.depends_on,
      sort_order: m.sort_order,
    }))
  );

  if (modulesError) throw new Error(modulesError.message);

  return company as Company;
}
