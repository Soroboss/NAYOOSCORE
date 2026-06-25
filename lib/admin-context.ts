import { getAuthedServerClient } from "@/lib/insforge-server";

export type AdminStats = {
  institutionsCount: number;
  companiesCount: number;
  usersCount: number;
  programsCount: number;
  pendingFundingCount: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const client = await getAuthedServerClient();
  const [institutions, companies, users, programs, funding] = await Promise.all([
    client.database.from("institutions").select("id", { count: "exact", head: true }),
    client.database.from("companies").select("id", { count: "exact", head: true }),
    client.database.from("profiles").select("id", { count: "exact", head: true }),
    client.database.from("programs").select("id", { count: "exact", head: true }),
    client.database
      .from("funding_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "pending", "under_review"]),
  ]);

  return {
    institutionsCount: institutions.count ?? 0,
    companiesCount: companies.count ?? 0,
    usersCount: users.count ?? 0,
    programsCount: programs.count ?? 0,
    pendingFundingCount: funding.count ?? 0,
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
