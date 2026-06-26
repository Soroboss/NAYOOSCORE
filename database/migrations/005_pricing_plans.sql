-- Plans tarifaires configurables (admin SaaS)

CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('institution', 'pme')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  monthly_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  yearly_price DECIMAL(15,2),
  max_pme INT,
  max_programs INT,
  max_users INT,
  for_whom TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_plans_category ON public.pricing_plans(category, sort_order);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY pricing_plans_select ON public.pricing_plans
  FOR SELECT TO authenticated
  USING (active = true OR public.is_super_admin());

CREATE POLICY pricing_plans_anon_select ON public.pricing_plans
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY pricing_plans_write ON public.pricing_plans
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

INSERT INTO public.pricing_plans (
  id, category, name, description, monthly_price, yearly_price,
  max_pme, max_programs, max_users, features, highlighted, sort_order
) VALUES
  ('starter', 'institution', 'Starter', 'Pour un premier programme pilote ou une petite structure.',
   49000, 470400, 25, 1, 2,
   '["Jusqu''à 25 PME accompagnées","1 programme actif","2 utilisateurs institution","Scoring et rapports de base","Support email"]'::jsonb,
   false, 1),
  ('pro', 'institution', 'Pro', 'Pour les institutions qui accompagnent un portefeuille actif.',
   149000, 1430400, 150, 5, 10,
   '["Jusqu''à 150 PME","5 programmes actifs","10 utilisateurs","Décisions de financement","Exports et rapports avancés","Support prioritaire"]'::jsonb,
   true, 2),
  ('enterprise', 'institution', 'Enterprise', 'Pour les grands réseaux, banques et programmes nationaux.',
   399000, 3830400, NULL, NULL, NULL,
   '["PME et programmes illimités","Utilisateurs illimités","API et intégrations","SLA dédié","Account manager","Personnalisation scoring"]'::jsonb,
   false, 3),
  ('pme_free', 'pme', 'PME Gratuit', 'Inscription directe sans institution partenaire.',
   0, NULL, NULL, NULL, NULL,
   '["Profil et diagnostic","Score de base","Modules essentiels (ventes, dépenses)","Recommandations IA limitées"]'::jsonb,
   false, 1),
  ('pme_plus', 'pme', 'PME Plus', 'Pour les PME sans institution mais souhaitant aller plus loin.',
   9900, NULL, NULL, NULL, NULL,
   '["Tous les modules métier","Recommandations IA complètes","Demande de financement","Documents et trésorerie avancée"]'::jsonb,
   false, 2)
ON CONFLICT (id) DO NOTHING;

UPDATE public.pricing_plans SET for_whom = 'Entrepreneurs autonomes' WHERE id = 'pme_free';
UPDATE public.pricing_plans SET for_whom = 'PME en croissance autonome' WHERE id = 'pme_plus';
