import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import {
  getInstitutionPlan,
  getPlanPrice,
  isWithinLimit,
  type PlanId,
} from "@/lib/pricing";
import type { Company } from "@/types/company";
import type { Institution } from "@/types/institution";
import type { Program } from "@/types/program";
import type { Subscription } from "@/types/subscription";
import { SCORE_THRESHOLDS } from "@/lib/constants";

function relationName(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name ?? null;
  }
  return (value as { name?: string }).name ?? null;
}

export type InstitutionWithRole = Institution & { member_role: string };

export type CompanyWithScore = Company & {
  global_score: number | null;
  score_status: string | null;
  program_name: string | null;
};

export type InstitutionStats = {
  companiesCount: number;
  programsCount: number;
  averageScore: number;
  pendingFundingCount: number;
  scoredCount: number;
  fundableCount: number;
  coveragePercent: number;
  usersCount: number;
};

export type ScoreBucket = {
  label: string;
  count: number;
  color: string;
};

export type InstitutionUsage = {
  subscription: Subscription | null;
  planId: PlanId | null;
  planName: string | null;
  monthlyAmount: number;
  limits: {
    pme: { current: number; max: number | null; percent: number; ok: boolean };
    programs: { current: number; max: number | null; percent: number; ok: boolean };
    users: { current: number; max: number | null; percent: number; ok: boolean };
  };
};

export type FundingRequestRow = {
  id: string;
  company_id: string;
  company_name: string;
  amount_requested: number;
  purpose: string | null;
  status: string;
  submitted_at: string | null;
};

export async function getInstitutionForUser(
  userId: string,
  accessToken?: string
): Promise<InstitutionWithRole | null> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return null;

  const client = createInsforgeServerClient(token);
  const { data: link } = await client.database
    .from("institution_users")
    .select("institution_id, role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!link?.institution_id) return null;

  const { data: institution } = await client.database
    .from("institutions")
    .select("*")
    .eq("id", link.institution_id)
    .maybeSingle();

  if (!institution) return null;

  return {
    ...(institution as Institution),
    member_role: link.role,
  };
}

export async function getInstitutionStats(
  institutionId: string,
  accessToken?: string
): Promise<InstitutionStats> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) {
    return {
      companiesCount: 0,
      programsCount: 0,
      averageScore: 0,
      pendingFundingCount: 0,
      scoredCount: 0,
      fundableCount: 0,
      coveragePercent: 0,
      usersCount: 0,
    };
  }

  const client = createInsforgeServerClient(token);

  const [{ data: companies }, { data: programs }, { data: funding }, { data: members }] =
    await Promise.all([
      client.database
        .from("companies")
        .select("id")
        .eq("institution_id", institutionId),
      client.database
        .from("programs")
        .select("id")
        .eq("institution_id", institutionId)
        .eq("status", "active"),
      client.database
        .from("funding_requests")
        .select("id")
        .eq("institution_id", institutionId)
        .in("status", ["submitted", "pending", "under_review"]),
      client.database
        .from("institution_users")
        .select("id")
        .eq("institution_id", institutionId),
    ]);

  const companyIds = (companies ?? []).map((c) => c.id);
  let averageScore = 0;
  let scoredCount = 0;
  let fundableCount = 0;

  if (companyIds.length > 0) {
    const { data: scores } = await client.database
      .from("scores")
      .select("company_id, global_score, calculated_at")
      .in("company_id", companyIds)
      .order("calculated_at", { ascending: false });

    const latestByCompany = new Map<string, number>();
    for (const row of scores ?? []) {
      if (!latestByCompany.has(row.company_id)) {
        latestByCompany.set(row.company_id, Number(row.global_score));
      }
    }
    const values = [...latestByCompany.values()];
    scoredCount = values.length;
    fundableCount = values.filter(
      (s) => s >= SCORE_THRESHOLDS.IN_PROGRESS.min
    ).length;
    averageScore =
      values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
  }

  const companiesCount = companyIds.length;
  const coveragePercent =
    companiesCount > 0 ? Math.round((scoredCount / companiesCount) * 100) : 0;

  return {
    companiesCount,
    programsCount: (programs ?? []).length,
    averageScore,
    pendingFundingCount: (funding ?? []).length,
    scoredCount,
    fundableCount,
    coveragePercent,
    usersCount: (members ?? []).length,
  };
}

export async function getInstitutionCompanies(
  institutionId: string,
  accessToken?: string
): Promise<CompanyWithScore[]> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return [];

  const client = createInsforgeServerClient(token);
  const { data: companies } = await client.database
    .from("companies")
    .select("*, programs(name)")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (!companies?.length) return [];

  const ids = companies.map((c) => c.id);
  const { data: scores } = await client.database
    .from("scores")
    .select("company_id, global_score, status, calculated_at")
    .in("company_id", ids)
    .order("calculated_at", { ascending: false });

  const scoreMap = new Map<string, { global_score: number; status: string }>();
  for (const s of scores ?? []) {
    if (!scoreMap.has(s.company_id)) {
      scoreMap.set(s.company_id, {
        global_score: Number(s.global_score),
        status: s.status ?? "",
      });
    }
  }

  return companies.map((c) => ({
    ...(c as Company),
    program_name: relationName(c.programs),
    global_score: scoreMap.get(c.id)?.global_score ?? null,
    score_status: scoreMap.get(c.id)?.status ?? null,
  }));
}

export async function getInstitutionCompanyDetail(
  institutionId: string,
  companyId: string,
  accessToken?: string
) {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return null;

  const client = createInsforgeServerClient(token);
  const { data: company } = await client.database
    .from("companies")
    .select("*, programs(name)")
    .eq("id", companyId)
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (!company) return null;

  const [
    { data: score },
    { data: diagnostic },
    { data: sales },
    { data: expenses },
    { data: funding },
  ] = await Promise.all([
    client.database
      .from("scores")
      .select("*")
      .eq("company_id", companyId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client.database
      .from("diagnostics")
      .select("responses, completed_at")
      .eq("company_id", companyId)
      .maybeSingle(),
    client.database.from("sales").select("amount").eq("company_id", companyId),
    client.database.from("expenses").select("amount").eq("company_id", companyId),
    client.database
      .from("funding_requests")
      .select("*")
      .eq("company_id", companyId)
      .eq("institution_id", institutionId)
      .order("submitted_at", { ascending: false })
      .limit(5),
  ]);

  const totalSales = (sales ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const program = relationName(company.programs);

  return {
    company: { ...(company as Company), program_name: program },
    score: score ?? null,
    diagnostic: diagnostic ?? null,
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,
    fundingRequests: funding ?? [],
  };
}

export async function getInstitutionPrograms(
  institutionId: string,
  accessToken?: string
): Promise<(Program & { companies_count: number })[]> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return [];

  const client = createInsforgeServerClient(token);
  const { data: programs } = await client.database
    .from("programs")
    .select("*")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (!programs?.length) return [];

  const { data: companies } = await client.database
    .from("companies")
    .select("program_id")
    .eq("institution_id", institutionId);

  const counts = new Map<string, number>();
  for (const c of companies ?? []) {
    if (c.program_id) {
      counts.set(c.program_id, (counts.get(c.program_id) ?? 0) + 1);
    }
  }

  return (programs as Program[]).map((p) => ({
    ...p,
    companies_count: counts.get(p.id) ?? 0,
  }));
}

export async function getInstitutionFundingRequests(
  institutionId: string,
  accessToken?: string
): Promise<FundingRequestRow[]> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return [];

  const client = createInsforgeServerClient(token);
  const { data: requests } = await client.database
    .from("funding_requests")
    .select("id, company_id, amount_requested, purpose, status, submitted_at, companies(name)")
    .eq("institution_id", institutionId)
    .order("submitted_at", { ascending: false });

  return (requests ?? []).map((r) => ({
    id: r.id,
    company_id: r.company_id,
    company_name: relationName(r.companies) ?? "PME",
    amount_requested: Number(r.amount_requested),
    purpose: r.purpose,
    status: r.status,
    submitted_at: r.submitted_at,
  }));
}

export async function getInstitutionScoringLeaderboard(
  institutionId: string,
  accessToken?: string
) {
  const companies = await getInstitutionCompanies(institutionId, accessToken);
  return [...companies].sort(
    (a, b) => (b.global_score ?? 0) - (a.global_score ?? 0)
  );
}

export async function getInstitutionScoreDistribution(
  institutionId: string,
  accessToken?: string
): Promise<ScoreBucket[]> {
  const companies = await getInstitutionCompanies(institutionId, accessToken);
  const buckets: ScoreBucket[] = [
    { label: "Non prêt (0-39)", count: 0, color: "#ef4444" },
    { label: "À structurer (40-59)", count: 0, color: "#f59e0b" },
    { label: "En progression (60-74)", count: 0, color: "#0077B6" },
    { label: "Pré-finançable (75-84)", count: 0, color: "#00BFA6" },
    { label: "Finançable (85+)", count: 0, color: "#059669" },
  ];

  for (const c of companies) {
    const score = c.global_score;
    if (score == null) continue;
    if (score < 40) buckets[0].count++;
    else if (score < 60) buckets[1].count++;
    else if (score < 75) buckets[2].count++;
    else if (score < 85) buckets[3].count++;
    else buckets[4].count++;
  }

  return buckets;
}

export async function getInstitutionSubscription(
  institutionId: string,
  accessToken?: string
): Promise<Subscription | null> {
  const token = accessToken ?? (await getAccessToken());
  if (!token) return null;

  const client = createInsforgeServerClient(token);
  const { data } = await client.database
    .from("subscriptions")
    .select("*")
    .eq("institution_id", institutionId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    institution_id: data.institution_id,
    plan_name: data.plan_name,
    status: data.status,
    amount: data.amount != null ? Number(data.amount) : null,
    started_at: data.started_at,
    ends_at: data.ends_at,
  };
}

export async function getInstitutionUsage(
  institutionId: string,
  accessToken?: string
): Promise<InstitutionUsage> {
  const [stats, subscription] = await Promise.all([
    getInstitutionStats(institutionId, accessToken),
    getInstitutionSubscription(institutionId, accessToken),
  ]);

  const plan = subscription
    ? getInstitutionPlan(subscription.plan_name)
    : null;
  const planId = (subscription?.plan_name as PlanId) ?? null;

  const pmeLimit = plan?.limits.maxPme ?? null;
  const programsLimit = plan?.limits.maxPrograms ?? null;
  const usersLimit = plan?.limits.maxUsers ?? null;

  return {
    subscription,
    planId,
    planName: plan?.name ?? null,
    monthlyAmount: subscription
      ? (subscription.amount ?? getPlanPrice(subscription.plan_name))
      : 0,
    limits: {
      pme: {
        current: stats.companiesCount,
        max: pmeLimit,
        ...isWithinLimit(stats.companiesCount, pmeLimit),
      },
      programs: {
        current: stats.programsCount,
        max: programsLimit,
        ...isWithinLimit(stats.programsCount, programsLimit),
      },
      users: {
        current: stats.usersCount,
        max: usersLimit,
        ...isWithinLimit(stats.usersCount, usersLimit),
      },
    },
  };
}
