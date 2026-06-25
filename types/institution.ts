import type { InstitutionType } from "@/lib/constants";

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  country: string;
  city: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
}

export interface InstitutionUser {
  id: string;
  institution_id: string;
  user_id: string;
  role: string;
  created_at: string;
}
