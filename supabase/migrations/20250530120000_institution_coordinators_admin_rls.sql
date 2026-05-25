-- Admin-only access to institution_coordinators (public.is_admin = profiles.role admin + admin email)

ALTER TABLE public.institution_coordinators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institution_coordinators_select_authenticated ON public.institution_coordinators;
DROP POLICY IF EXISTS institution_coordinators_admin_write ON public.institution_coordinators;
DROP POLICY IF EXISTS institution_coordinators_select_admin ON public.institution_coordinators;
DROP POLICY IF EXISTS institution_coordinators_select_instructor ON public.institution_coordinators;
DROP POLICY IF EXISTS institution_coordinators_insert_admin ON public.institution_coordinators;
DROP POLICY IF EXISTS institution_coordinators_update_admin ON public.institution_coordinators;
DROP POLICY IF EXISTS institution_coordinators_delete_admin ON public.institution_coordinators;

CREATE POLICY institution_coordinators_select_admin
ON public.institution_coordinators
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY institution_coordinators_insert_admin
ON public.institution_coordinators
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY institution_coordinators_update_admin
ON public.institution_coordinators
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY institution_coordinators_delete_admin
ON public.institution_coordinators
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_coordinators TO authenticated;
