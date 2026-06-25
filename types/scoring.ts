export interface Score {
  id: string;
  company_id: string;
  management_score: number;
  financial_score: number;
  growth_score: number;
  compliance_score: number;
  governance_score: number;
  funding_readiness_score: number;
  global_score: number;
  status: string;
  calculated_at: string;
}

export interface ScoreHistory {
  id: string;
  company_id: string;
  global_score: number;
  management_score: number;
  financial_score: number;
  growth_score: number;
  compliance_score: number;
  governance_score: number;
  recorded_at: string;
}

export interface ScoringBreakdown {
  management: number;
  financial: number;
  growth: number;
  compliance: number;
  governance: number;
  global: number;
  status: string;
  statusLabel: string;
}
