-- Admin-only DELETE on sessions (almogg57@gmail.com via public.is_admin())
-- Instructors keep UPDATE-only access; no DELETE policy for them.

CREATE POLICY sessions_admin_delete
ON public.sessions
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.sessions TO authenticated;
