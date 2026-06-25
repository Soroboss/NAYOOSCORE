-- Données de démo pour tester l'espace Institution
-- Exécuter après avoir un utilisateur auth avec role INSTITUTION_ADMIN dans profiles
-- Remplacer USER_ID par l'UUID de l'utilisateur institution

-- Institution de démo
INSERT INTO public.institutions (id, name, type, country, city, email, phone, status)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Fonds PME Côte d''Ivoire',
  'fund',
  'Côte d''Ivoire',
  'Abidjan',
  'contact@fondspme.ci',
  '+225 07 00 00 00 00',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Lier l'utilisateur institution (remplacer USER_ID)
-- INSERT INTO public.institution_users (institution_id, user_id, role)
-- VALUES ('a0000000-0000-4000-8000-000000000001', 'USER_ID', 'INSTITUTION_ADMIN');

-- Programme de démo
INSERT INTO public.programs (id, institution_id, name, description, objective, status)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Accélération PME 2026',
  'Programme d''accompagnement des PME à fort potentiel',
  'Améliorer le score de finançabilité',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Pour rattacher une PME existante à l'institution :
-- UPDATE public.companies
-- SET institution_id = 'a0000000-0000-4000-8000-000000000001',
--     program_id = 'b0000000-0000-4000-8000-000000000001'
-- WHERE id = 'COMPANY_ID';
