-- Abonnements démo pour les institutions de test
-- Exécuter après institution_demo.sql si l'institution existe

INSERT INTO public.subscriptions (institution_id, plan_name, status, amount)
SELECT i.id, 'pro', 'active', 149000
FROM public.institutions i
WHERE i.name ILIKE '%demo%' OR i.email ILIKE '%demo%'
ON CONFLICT DO NOTHING;

-- Si aucune institution demo, attribuer au premier enregistrement
INSERT INTO public.subscriptions (institution_id, plan_name, status, amount)
SELECT i.id, 'starter', 'active', 49000
FROM public.institutions i
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.institution_id = i.id)
ORDER BY i.created_at ASC
LIMIT 1;
