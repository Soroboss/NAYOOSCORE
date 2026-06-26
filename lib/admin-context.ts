import { getAuthedServerClient } from "@/lib/insforge-server";
import { getInstitutionPlan, getPlanPrice } from "@/lib/pricing";
import type { SubscriptionWithInstitution } from "@/types/subscription";

export type AdminStats = {
  institutionsCount: number;
  companiesCount: number;
  usersCount: number;
  programsCount: number;
  pendingFundingCount: number;
  activeSubscriptionsCount: number;
  mrr: number;
  scoredCompaniesCount: number;
  averagePlatformScore: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const client = await getAuthedServerClient();
  const [institutions, companies, users, programs, funding, subscriptions, scores] =
    await Promise.all([
    client.database.from("institutions").select("id", { count: "exact", head: true }),
    client.database.from("companies").select("id", { count: "exact", head: true }),
    client.database.from("profiles").select("id", { count: "exact", head: true }),
    client.database.from("programs").select("id", { count: "exact", head: true }),
    client.database
      .from("funding_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "pending", "under_review"]),
    client.database
      .from("subscriptions")
      .select("plan_name, amount, status")
      .eq("status", "active"),
    client.database
      .from("scores")
      .select("company_id, global_score, calculated_at")
      .order("calculated_at", { ascending: false }),
  ]);

  const activeSubs = subscriptions.data ?? [];
  const mrr = activeSubs.reduce((sum, sub) => {
    const amount = sub.amount != null ? Number(sub.amount) : getPlanPrice(sub.plan_name);
    return sum + amount;
  }, 0);

  const latestScores = new Map<string, number>();
  for (const row of scores.data ?? []) {
    if (!latestScores.has(row.company_id)) {
      latestScores.set(row.company_id, Number(row.global_score));
    }
  }
  const scoreValues = [...latestScores.values()];
  const averagePlatformScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 0;

  return {
    institutionsCount: institutions.count ?? 0,
    companiesCount: companies.count ?? 0,
    usersCount: users.count ?? 0,
    programsCount: programs.count ?? 0,
    pendingFundingCount: funding.count ?? 0,
    activeSubscriptionsCount: activeSubs.length,
    mrr,
    scoredCompaniesCount: latestScores.size,
    averagePlatformScore,
  };
}

export async function getAdminInstitutions() {
  const client = await getAuthedServerClient();
  const { data } = await client.database
    .from("institutions")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminUsers() {
  const client = await getAuthedServerClient();
  const { data } = await client.database
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getAdminAuditLogs() {
  const client = await getAuthedServerClient();
  const { data } = await client.database
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getAdminPrograms() {
  const client = await getAuthedServerClient();
  const { data } = await client.database
    .from("programs")
    .select("*, institutions(name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminSubscriptions(): Promise<SubscriptionWithInstitution[]> {
  const client = await getAuthedServerClient();
  const { data } = await client.database
    .from("subscriptions")
    .select("*, institutions(name)")
    .order("started_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    institution_id: row.institution_id,
    plan_name: row.plan_name,
    status: row.status,
    amount: row.amount != null ? Number(row.amount) : null,
    started_at: row.started_at,
    ends_at: row.ends_at,
    institution_name:
      (Array.isArray(row.institutions)
        ? row.institutions[0]?.name
        : row.institutions?.name) ?? "Institution",
  }));
}

export type PlanDistribution = { planId: string; count: number; mrr: number };

export async function getAdminBillingOverview() {
  const subscriptions = await getAdminSubscriptions();
  const active = subscriptions.filter((s) => s.status === "active");

  const byPlan = new Map<string, PlanDistribution>();
  for (const sub of active) {
    const existing = byPlan.get(sub.plan_name) ?? {
      planId: sub.plan_name,
      count: 0,
      mrr: 0,
    };
    const monthly =
      sub.amount != null ? sub.amount : getPlanPrice(sub.plan_name);
    byPlan.set(sub.plan_name, {
      planId: sub.plan_name,
      count: existing.count + 1,
      mrr: existing.mrr + monthly,
    });
  }

  const institutionsWithoutPlan = await getAdminInstitutionsWithoutSubscription();

  return {
    subscriptions,
    planDistribution: [...byPlan.values()],
    institutionsWithoutPlan,
    totalMrr: active.reduce(
      (sum, s) => sum + (s.amount ?? getPlanPrice(s.plan_name)),
      0
    ),
  };
}

export async function getAdminInstitutionsWithoutSubscription() {
  const [institutions, subscriptions] = await Promise.all([
    getAdminInstitutions(),
    getAdminSubscriptions(),
  ]);

  const subscribedIds = new Set(
    subscriptions.filter((s) => s.status === "active").map((s) => s.institution_id)
  );

  return institutions
    .filter((i) => !subscribedIds.has(i.id))
    .map((i) => ({ id: i.id, name: i.name }));
}

export async function getAdminInstitutionsWithPlans() {
  const institutions = await getAdminInstitutions();
  const subscriptions = await getAdminSubscriptions();

  const subByInstitution = new Map<string, SubscriptionWithInstitution>();
  for (const sub of subscriptions) {
    if (sub.status === "active" && !subByInstitution.has(sub.institution_id)) {
      subByInstitution.set(sub.institution_id, sub);
    }
  }

  return institutions.map((inst) => {
    const sub = subByInstitution.get(inst.id);
    const plan = sub ? getInstitutionPlan(sub.plan_name) : null;
    return {
      ...inst,
      subscription: sub ?? null,
      planName: plan?.name ?? null,
      monthlyAmount: sub
        ? (sub.amount ?? getPlanPrice(sub.plan_name))
        : null,
    };
  });
}
