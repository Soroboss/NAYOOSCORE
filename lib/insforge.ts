import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

export function createInsforgeClient() {
  if (!baseUrl || !anonKey) {
    throw new Error(
      "Variables NEXT_PUBLIC_INSFORGE_URL et NEXT_PUBLIC_INSFORGE_ANON_KEY requises"
    );
  }

  return createClient({ baseUrl, anonKey });
}

export function createInsforgeServerClient() {
  const serviceRoleKey = process.env.INSFORGE_SERVICE_ROLE_KEY;

  if (!baseUrl || !serviceRoleKey) {
    throw new Error(
      "Variables NEXT_PUBLIC_INSFORGE_URL et INSFORGE_SERVICE_ROLE_KEY requises côté serveur"
    );
  }

  return createClient({ baseUrl, anonKey: serviceRoleKey });
}

export function isInsforgeConfigured(): boolean {
  return Boolean(baseUrl && anonKey);
}
