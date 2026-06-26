-- Rôles collaborateurs étendus avec permissions granulaires

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'INSTITUTION_VIEWER';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'PME_ACCOUNTANT';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'SAAS_SUPPORT';

-- Harmoniser les rôles entreprise (OWNER → PME_OWNER)
UPDATE public.company_users SET role = 'PME_OWNER' WHERE role = 'OWNER';
