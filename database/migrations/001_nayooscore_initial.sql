-- Nayooscore — Schéma initial InsForge (multi-tenant + RLS)
-- Profils liés à auth.users

CREATE TYPE public.user_role AS ENUM (
  'SUPER_ADMIN', 'SAAS_MANAGER', 'INSTITUTION_ADMIN',
  'INSTITUTION_ANALYST', 'PME_OWNER', 'PME_STAFF', 'VIEWER'
);

CREATE TYPE public.institution_type AS ENUM (
  'ministry', 'ngo', 'bank', 'fund', 'incubator', 'accelerator', 'private_company'
);

CREATE TYPE public.entity_status AS ENUM (
  'active', 'inactive', 'suspended', 'draft', 'archived', 'completed'
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.institution_type NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.institution_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'INSTITUTION_ANALYST',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, user_id)
);

CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  status public.entity_status NOT NULL DEFAULT 'draft',
  scoring_model_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status public.entity_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sector TEXT,
  legal_status TEXT,
  rccm TEXT,
  tax_id TEXT,
  country TEXT,
  city TEXT,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'PME_STAFF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  sale_date DATE NOT NULL,
  customer_name TEXT,
  payment_method TEXT,
  proof_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT,
  description TEXT,
  payment_method TEXT,
  proof_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.treasury_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  entry_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT,
  hire_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL(15,2) NOT NULL DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  storage_key TEXT NOT NULL,
  storage_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  management_score SMALLINT NOT NULL DEFAULT 0,
  financial_score SMALLINT NOT NULL DEFAULT 0,
  growth_score SMALLINT NOT NULL DEFAULT 0,
  compliance_score SMALLINT NOT NULL DEFAULT 0,
  governance_score SMALLINT NOT NULL DEFAULT 0,
  funding_readiness_score SMALLINT NOT NULL DEFAULT 0,
  global_score SMALLINT NOT NULL DEFAULT 0,
  status TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  global_score SMALLINT NOT NULL,
  management_score SMALLINT NOT NULL,
  financial_score SMALLINT NOT NULL,
  growth_score SMALLINT NOT NULL,
  compliance_score SMALLINT NOT NULL,
  governance_score SMALLINT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.funding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  amount_requested DECIMAL(15,2) NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ
);

CREATE TABLE public.funding_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_request_id UUID NOT NULL REFERENCES public.funding_requests(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  amount_approved DECIMAL(15,2),
  reason TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  generated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  amount DECIMAL(15,2),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index multi-tenant
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_companies_institution ON public.companies(institution_id);
CREATE INDEX idx_programs_institution ON public.programs(institution_id);
CREATE INDEX idx_sales_company ON public.sales(company_id);
CREATE INDEX idx_expenses_company ON public.expenses(company_id);
CREATE INDEX idx_scores_company ON public.scores(company_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Triggers updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

-- Helper functions RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'SAAS_MANAGER')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_institution(inst_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.institution_users
      WHERE institution_id = inst_uuid AND user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_company(company_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.company_users
      WHERE company_id = company_uuid AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.companies c
      INNER JOIN public.institution_users iu ON iu.institution_id = c.institution_id
      WHERE c.id = company_uuid AND iu.user_id = auth.uid()
    );
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

-- Policies: institutions
CREATE POLICY institutions_select ON public.institutions FOR SELECT TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(id));

CREATE POLICY institutions_write ON public.institutions FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Policies: institution_users
CREATE POLICY institution_users_select ON public.institution_users FOR SELECT TO authenticated
  USING (public.is_super_admin() OR user_id = auth.uid() OR public.can_access_institution(institution_id));

CREATE POLICY institution_users_write ON public.institution_users FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(institution_id))
  WITH CHECK (public.is_super_admin() OR public.can_access_institution(institution_id));

-- Policies: programs & cohorts
CREATE POLICY programs_select ON public.programs FOR SELECT TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(institution_id));

CREATE POLICY programs_write ON public.programs FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(institution_id))
  WITH CHECK (public.is_super_admin() OR public.can_access_institution(institution_id));

CREATE POLICY cohorts_select ON public.cohorts FOR SELECT TO authenticated
  USING (
    public.is_super_admin() OR EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND public.can_access_institution(p.institution_id)
    )
  );

CREATE POLICY cohorts_write ON public.cohorts FOR ALL TO authenticated
  USING (
    public.is_super_admin() OR EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND public.can_access_institution(p.institution_id)
    )
  )
  WITH CHECK (
    public.is_super_admin() OR EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_id AND public.can_access_institution(p.institution_id)
    )
  );

-- Policies: companies
CREATE POLICY companies_select ON public.companies FOR SELECT TO authenticated
  USING (public.can_access_company(id));

CREATE POLICY companies_write ON public.companies FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(institution_id))
  WITH CHECK (public.is_super_admin() OR public.can_access_institution(institution_id));

-- Policies: company_users
CREATE POLICY company_users_select ON public.company_users FOR SELECT TO authenticated
  USING (public.can_access_company(company_id));

CREATE POLICY company_users_write ON public.company_users FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.can_access_company(company_id))
  WITH CHECK (public.is_super_admin() OR public.can_access_company(company_id));

-- Generic company-scoped tables
CREATE POLICY diagnostics_policy ON public.diagnostics FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY sales_policy ON public.sales FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY expenses_policy ON public.expenses FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY treasury_policy ON public.treasury_entries FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY customers_policy ON public.customers FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY suppliers_policy ON public.suppliers FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY employees_policy ON public.employees FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY inventory_policy ON public.inventory_items FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY documents_policy ON public.documents FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY scores_policy ON public.scores FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY score_history_policy ON public.score_history FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY recommendations_policy ON public.recommendations FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

-- Funding
CREATE POLICY funding_requests_select ON public.funding_requests FOR SELECT TO authenticated
  USING (public.can_access_company(company_id) OR public.can_access_institution(institution_id));

CREATE POLICY funding_requests_write ON public.funding_requests FOR ALL TO authenticated
  USING (public.can_access_company(company_id) OR public.can_access_institution(institution_id))
  WITH CHECK (public.can_access_company(company_id) OR public.can_access_institution(institution_id));

CREATE POLICY funding_decisions_policy ON public.funding_decisions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.funding_requests fr
      WHERE fr.id = funding_request_id
        AND (public.can_access_company(fr.company_id) OR public.can_access_institution(fr.institution_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.funding_requests fr
      WHERE fr.id = funding_request_id
        AND (public.can_access_company(fr.company_id) OR public.can_access_institution(fr.institution_id))
    )
  );

-- Reports & subscriptions (institution scoped)
CREATE POLICY reports_policy ON public.reports FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(institution_id))
  WITH CHECK (public.is_super_admin() OR public.can_access_institution(institution_id));

CREATE POLICY subscriptions_policy ON public.subscriptions FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.can_access_institution(institution_id))
  WITH CHECK (public.is_super_admin());

-- Audit logs (super admin read, authenticated insert own)
CREATE POLICY audit_logs_select ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

-- Notifications (own only)
CREATE POLICY notifications_policy ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
