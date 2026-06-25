export interface Sale {
  id: string;
  company_id: string;
  amount: number;
  sale_date: string;
  customer_name: string;
  payment_method: string;
  proof_url: string | null;
  created_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  company_id: string;
  amount: number;
  expense_date: string;
  category: string;
  description: string;
  payment_method: string;
  proof_url: string | null;
  created_by: string;
  created_at: string;
}

export interface TreasuryEntry {
  id: string;
  company_id: string;
  amount: number;
  entry_date: string;
  type: "inflow" | "outflow";
  description: string;
  created_by: string;
  created_at: string;
}

export interface FundingRequest {
  id: string;
  company_id: string;
  institution_id: string;
  amount_requested: number;
  purpose: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  submitted_at: string | null;
}

export interface FundingDecision {
  id: string;
  funding_request_id: string;
  decision: "accompany" | "finance" | "reject" | "observe";
  amount_approved: number | null;
  reason: string;
  decided_by: string;
  decided_at: string;
}
