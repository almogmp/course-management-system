-- Admin-only DELETE for courses (and idempotent session / series delete for force-delete flow)

DROP POLICY IF EXISTS courses_admin_delete ON public.courses;

CREATE POLICY courses_admin_delete
ON public.courses
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.courses TO authenticated;

-- Force delete removes sessions before courses — ensure admin DELETE on sessions
DROP POLICY IF EXISTS sessions_admin_delete ON public.sessions;

CREATE POLICY sessions_admin_delete
ON public.sessions
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.sessions TO authenticated;

-- Bulk series cleanup during course/institution force delete
DROP POLICY IF EXISTS session_series_admin_delete ON public.session_series;

CREATE POLICY session_series_admin_delete
ON public.session_series
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.session_series TO authenticated;
