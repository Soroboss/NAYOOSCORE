import { createInsforgeAdminClient } from "@/lib/insforge-server";
import type { UserRole } from "@/lib/constants";

function extractProfile(value: unknown): { full_name: string; email: string } | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0] as { full_name?: string; email?: string } | undefined;
    if (!first) return null;
    return { full_name: first.full_name ?? "—", email: first.email ?? "—" };
  }
  const profile = value as { full_name?: string; email?: string };
  return { full_name: profile.full_name ?? "—", email: profile.email ?? "—" };
}

export type CollaboratorRow = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  link_id: string;
};

export async function listAdminCollaborators(): Promise<CollaboratorRow[]> {
  const client = createInsforgeAdminClient();
  const { data } = await client.database
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["SAAS_MANAGER", "SAAS_SUPPORT"])
    .order("full_name", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    link_id: row.id,
  }));
}

export async function listInstitutionCollaborators(
  institutionId: string
): Promise<CollaboratorRow[]> {
  const client = createInsforgeAdminClient();
  const { data } = await client.database
    .from("institution_users")
    .select("id, user_id, role, profiles(full_name, email)")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => {
    const profile = extractProfile(row.profiles);
    return {
      id: row.user_id,
      user_id: row.user_id,
      full_name: profile?.full_name ?? "—",
      email: profile?.email ?? "—",
      role: row.role,
      link_id: row.id,
    };
  });
}

export async function listPmeCollaborators(companyId: string): Promise<CollaboratorRow[]> {
  const client = createInsforgeAdminClient();
  const { data } = await client.database
    .from("company_users")
    .select("id, user_id, role, profiles(full_name, email)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => {
    const profile = extractProfile(row.profiles);
    return {
      id: row.user_id,
      user_id: row.user_id,
      full_name: profile?.full_name ?? "—",
      email: profile?.email ?? "—",
      role: row.role === "OWNER" ? "PME_OWNER" : row.role,
      link_id: row.id,
    };
  });
}

export const ADMIN_INVITE_ROLES: UserRole[] = ["SAAS_MANAGER", "SAAS_SUPPORT"];
export const INSTITUTION_INVITE_ROLES: UserRole[] = [
  "INSTITUTION_ADMIN",
  "INSTITUTION_ANALYST",
  "INSTITUTION_VIEWER",
];
export const PME_INVITE_ROLES: UserRole[] = ["PME_STAFF", "PME_ACCOUNTANT", "VIEWER"];
