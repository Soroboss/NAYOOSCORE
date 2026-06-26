import type { UserRole } from "@/lib/constants";
import { getAccessToken } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import type { User } from "@/types/user";

export async function upsertProfile(
  input: {
    id: string;
    full_name: string;
    email: string;
    role?: UserRole;
    phone?: string | null;
  },
  accessToken?: string
) {
  const token = accessToken ?? (await getAccessToken());
  const client = createInsforgeServerClient(token);

  const { data: existing } = await client.database
    .from("profiles")
    .select("id")
    .eq("id", input.id)
    .maybeSingle();

  const payload = {
    id: input.id,
    full_name: input.full_name,
    email: input.email,
    role: input.role ?? "PME_OWNER",
    phone: input.phone ?? null,
  };

  if (existing) {
    const { error } = await client.database
      .from("profiles")
      .update({
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        ...(input.role ? { role: input.role } : {}),
      })
      .eq("id", input.id);

    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await client.database.from("profiles").insert([payload]);
  if (error) throw new Error(error.message);
}

export async function getProfileByUserId(userId: string): Promise<User | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const client = createInsforgeServerClient(accessToken);
  const { data, error } = await client.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as User;
}

export async function refreshSessionIfNeeded(): Promise<string | null> {
  const accessToken = await getAccessToken();
  if (accessToken) return accessToken;
  // Le rafraîchissement des cookies est géré par /api/auth/refresh (middleware / route).
  return null;
}
