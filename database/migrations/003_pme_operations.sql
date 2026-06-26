-- Modules opérationnels PME : ventes enrichies, primes, marketing, terrain

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'service',
  ADD COLUMN IF NOT EXISTS item_name TEXT,
  ADD COLUMN IF NOT EXISTS quantity DECIMAL(15,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'other';

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS monthly_salary DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS public.employee_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  bonus_date DATE NOT NULL,
  bonus_type TEXT NOT NULL DEFAULT 'prime',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketing_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  budget_amount DECIMAL(15,2) DEFAULT 0,
  spent_amount DECIMAL(15,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  target_audience TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.field_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  action_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  objective TEXT,
  cost DECIMAL(15,2) DEFAULT 0,
  revenue_generated DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_bonuses_company ON public.employee_bonuses(company_id);
CREATE INDEX IF NOT EXISTS idx_marketing_actions_company ON public.marketing_actions(company_id);
CREATE INDEX IF NOT EXISTS idx_field_actions_company ON public.field_actions(company_id);

ALTER TABLE public.employee_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_bonuses_policy ON public.employee_bonuses FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY marketing_actions_policy ON public.marketing_actions FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

CREATE POLICY field_actions_policy ON public.field_actions FOR ALL TO authenticated
  USING (public.can_access_company(company_id))
  WITH CHECK (public.can_access_company(company_id));

-- Activer les nouveaux modules pour les PME existantes
INSERT INTO public.company_modules (company_id, module_key, enabled, required, sort_order)
SELECT c.id, m.key, true, false, m.ord
FROM public.companies c
CROSS JOIN (
  VALUES ('marketing', 60), ('field_ops', 61)
) AS m(key, ord)
ON CONFLICT (company_id, module_key) DO NOTHING;
