-- Full admin DELETE authority: explicit policies + GRANT DELETE on all deletable entities

-- instructors
DROP POLICY IF EXISTS instructors_delete_admin ON public.instructors;

CREATE POLICY instructors_delete_admin
ON public.instructors
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.instructors TO authenticated;

-- institutions
DROP POLICY IF EXISTS institutions_admin_delete ON public.institutions;

CREATE POLICY institutions_admin_delete
ON public.institutions
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.institutions TO authenticated;

-- primary_suppliers
DROP POLICY IF EXISTS primary_suppliers_admin_delete ON public.primary_suppliers;

CREATE POLICY primary_suppliers_admin_delete
ON public.primary_suppliers
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.primary_suppliers TO authenticated;

-- courses
DROP POLICY IF EXISTS courses_admin_delete ON public.courses;

CREATE POLICY courses_admin_delete
ON public.courses
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.courses TO authenticated;

-- sessions
DROP POLICY IF EXISTS sessions_admin_delete ON public.sessions;

CREATE POLICY sessions_admin_delete
ON public.sessions
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.sessions TO authenticated;

-- session_series (bulk groups; removed before/with course force delete)
DROP POLICY IF EXISTS session_series_admin_delete ON public.session_series;

CREATE POLICY session_series_admin_delete
ON public.session_series
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.session_series TO authenticated;

-- institution_coordinators (force delete institution)
DROP POLICY IF EXISTS institution_coordinators_delete_admin ON public.institution_coordinators;

CREATE POLICY institution_coordinators_delete_admin
ON public.institution_coordinators
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.institution_coordinators TO authenticated;
