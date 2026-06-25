export interface Program {
  id: string;
  institution_id: string;
  name: string;
  description: string;
  objective: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "completed" | "archived";
  scoring_model_id: string | null;
  created_at: string;
}

export interface Cohort {
  id: string;
  program_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "completed";
  created_at: string;
}
