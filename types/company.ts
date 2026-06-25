export interface Company {
  id: string;
  institution_id: string;
  program_id: string;
  name: string;
  sector: string;
  legal_status: string;
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
