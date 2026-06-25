export interface Company {
  id: string;
  institution_id: string | null;
  program_id: string | null;
  cohort_id?: string | null;
  name: string;
  sector: string;
  legal_status: string;
  business_type?: string | null;
  onboarding_completed?: boolean;
  rccm: string | null;
  tax_id: string | null;
  country: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  created_at: string;
}
