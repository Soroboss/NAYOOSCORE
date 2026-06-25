import { ROLE_REDIRECTS, type UserRole } from "@/lib/constants";
import type { User } from "@/types/user";

export type AuthSession = {
  user: User;
  accessToken: string;
};

export async function getCurrentUser(): Promise<User | null> {
  // Implémenté à l'étape 4 (authentification InsForge)
  return null;
}

export function getRedirectPathForRole(role: UserRole): string {
  return ROLE_REDIRECTS[role] ?? "/login";
}
