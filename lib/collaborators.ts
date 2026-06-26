import {
  createInsforgeAdminClient,
  getAuthedServerClient,
  isInsforgeAdminConfigured,
} from "@/lib/insforge-server";
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

export type CollaboratorListResult = {
  collaborators: CollaboratorRow[];
  error?: string;
};

function mapAdminProfileRows(
  data: Array<{ id: string; full_name: string; email: string; role: string }>
): CollaboratorRow[] {
  return data.map((row) => ({
    id: row.id,
    user_id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    link_id: row.id,
  }));
}

export async function listAdminCollaborators(): Promise<CollaboratorListResult> {
  const roles = ["SAAS_MANAGER", "SAAS_SUPPORT"] as const;

  if (isInsforgeAdminConfigured()) {
    try {
      const client = createInsforgeAdminClient();
      const { data, error } = await client.database
        .from("profiles")
        .select("id, full_name, email, role")
        .in("role", [...roles])
        .order("full_name", { ascending: true });

      if (error) {
        return { collaborators: [], error: error.message };
      }

      return { collaborators: mapAdminProfileRows(data ?? []) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Impossible de charger l'équipe plateforme.";
      return { collaborators: [], error: message };
    }
  }

  try {
    const client = await getAuthedServerClient();
    const { data, error } = await client.database
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", [...roles])
      .order("full_name", { ascending: true });

    if (error) {
      return { collaborators: [], error: error.message };
    }

    return { collaborators: mapAdminProfileRows(data ?? []) };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "Configuration serveur incomplète pour la gestion des collaborateurs.";
    return { collaborators: [], error: message };
  }
}

export async function listInstitutionCollaborators(
  institutionId: string
): Promise<CollaboratorListResult> {
  const query = (client: ReturnType<typeof createInsforgeAdminClient>) =>
    client.database
      .from("institution_users")
      .select("id, user_id, role, profiles(full_name, email)")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: true });

  const mapRows = (
    data: Array<{
      id: string;
      user_id: string;
      role: string;
      profiles: unknown;
    }>
  ): CollaboratorRow[] =>
    data.map((row) => {
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

  if (isInsforgeAdminConfigured()) {
    try {
      const client = createInsforgeAdminClient();
      const { data, error } = await query(client);
      if (error) return { collaborators: [], error: error.message };
      return { collaborators: mapRows(data ?? []) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Impossible de charger l'équipe institution.";
      return { collaborators: [], error: message };
    }
  }

  try {
    const client = await getAuthedServerClient();
    const { data, error } = await query(client);
    if (error) return { collaborators: [], error: error.message };
    return { collaborators: mapRows(data ?? []) };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Impossible de charger l'équipe institution.";
    return { collaborators: [], error: message };
  }
}

export async function listPmeCollaborators(
  companyId: string
): Promise<CollaboratorListResult> {
  const query = (client: ReturnType<typeof createInsforgeAdminClient>) =>
    client.database
      .from("company_users")
      .select("id, user_id, role, profiles(full_name, email)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

  const mapRows = (
    data: Array<{
      id: string;
      user_id: string;
      role: string;
      profiles: unknown;
    }>
  ): CollaboratorRow[] =>
    data.map((row) => {
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

  if (isInsforgeAdminConfigured()) {
    try {
      const client = createInsforgeAdminClient();
      const { data, error } = await query(client);
      if (error) return { collaborators: [], error: error.message };
      return { collaborators: mapRows(data ?? []) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Impossible de charger l'équipe PME.";
      return { collaborators: [], error: message };
    }
  }

  try {
    const client = await getAuthedServerClient();
    const { data, error } = await query(client);
    if (error) return { collaborators: [], error: error.message };
    return { collaborators: mapRows(data ?? []) };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Impossible de charger l'équipe PME.";
    return { collaborators: [], error: message };
  }
}

export const ADMIN_INVITE_ROLES: UserRole[] = ["SAAS_MANAGER", "SAAS_SUPPORT"];
export const INSTITUTION_INVITE_ROLES: UserRole[] = [
  "INSTITUTION_ADMIN",
  "INSTITUTION_ANALYST",
  "INSTITUTION_VIEWER",
];
export const PME_INVITE_ROLES: UserRole[] = ["PME_STAFF", "PME_ACCOUNTANT", "VIEWER"];
