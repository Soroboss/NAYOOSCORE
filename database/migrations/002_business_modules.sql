ALTER TABLE public.companies
  ALTER COLUMN institution_id DROP NOT NULL;

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.company_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  depends_on TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_company_modules_company ON public.company_modules(company_id);

ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_modules_policy ON public.company_modules
  FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));
