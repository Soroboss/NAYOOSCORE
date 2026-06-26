-- Renforcement sécurité : FORCE RLS sur toutes les tables publiques
-- Empêche le contournement RLS par le propriétaire de table

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',
      tbl.tablename
    );
  END LOOP;
END $$;

-- Restreindre les écritures sur subscriptions aux super-admins uniquement
DROP POLICY IF EXISTS subscriptions_policy ON public.subscriptions;

CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR public.can_access_institution(institution_id)
  );

CREATE POLICY subscriptions_insert ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY subscriptions_update ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY subscriptions_delete ON public.subscriptions
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- Audit logs : empêcher la modification/suppression
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY audit_logs_no_update ON public.audit_logs
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY audit_logs_no_delete ON public.audit_logs
  FOR DELETE TO authenticated
  USING (false);
