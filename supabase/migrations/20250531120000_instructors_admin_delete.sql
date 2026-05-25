-- Allow admins to hard-delete instructor rows when no FK references remain.

CREATE POLICY instructors_delete_admin
ON public.instructors
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT DELETE ON public.instructors TO authenticated;
