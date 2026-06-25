import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

export function createInsforgeServerClient(accessToken?: string) {
  if (!baseUrl || !anonKey) {
    throw new Error(
      "Variables NEXT_PUBLIC_INSFORGE_URL et NEXT_PUBLIC_INSFORGE_ANON_KEY requises"
    );
  }

  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
    edgeFunctionToken: accessToken,
  });
}

export function createInsforgeAdminClient() {
  const serviceRoleKey = process.env.INSFORGE_SERVICE_ROLE_KEY;

  if (!baseUrl || !serviceRoleKey) {
    throw new Error(
      "Variables NEXT_PUBLIC_INSFORGE_URL et INSFORGE_SERVICE_ROLE_KEY requises"
    );
  }

  return createClient({
    baseUrl,
    anonKey: serviceRoleKey,
    isServerMode: true,
  });
}
