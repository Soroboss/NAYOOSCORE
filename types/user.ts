import type { UserRole } from "@/lib/constants";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/** Profil InsForge — table `profiles` liée à `auth.users` */
export type Profile = User;
