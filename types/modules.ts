export type CompanyModule = {
  id: string;
  company_id: string;
  module_key: string;
  enabled: boolean;
  required: boolean;
  depends_on: string[];
  sort_order: number;
  created_at: string;
};
