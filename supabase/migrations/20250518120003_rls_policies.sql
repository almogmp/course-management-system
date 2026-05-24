-- Row Level Security policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.instructors FORCE ROW LEVEL SECURITY;
ALTER TABLE public.institutions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.primary_suppliers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.courses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log FORCE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin() OR id = auth.uid());

CREATE POLICY profiles_update_admin
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY profiles_update_own_notifications
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = (SELECT p.role FROM public.profiles AS p WHERE p.id = auth.uid())
  AND approval_status = (SELECT p.approval_status FROM public.profiles AS p WHERE p.id = auth.uid())
  AND email = (SELECT p.email FROM public.profiles AS p WHERE p.id = auth.uid())
);

-- instructors
CREATE POLICY instructors_select
ON public.instructors
FOR SELECT
TO authenticated
USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY instructors_insert_admin
ON public.instructors
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY instructors_insert_self_registration
ON public.instructors
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'instructor'
      AND p.approval_status = 'pending'
  )
);

CREATE POLICY instructors_update_admin
ON public.instructors
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- institutions
CREATE POLICY institutions_admin_all
ON public.institutions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- primary_suppliers
CREATE POLICY primary_suppliers_admin_all
ON public.primary_suppliers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- courses (admin only — instructors use instructor_sessions view)
CREATE POLICY courses_admin_select
ON public.courses
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY courses_admin_insert
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY courses_admin_update
ON public.courses
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- sessions (admin: no DELETE — sessions are managed via status changes)
CREATE POLICY sessions_admin_select
ON public.sessions
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY sessions_admin_insert
ON public.sessions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY sessions_admin_update
ON public.sessions
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Instructors read sessions only via public.instructor_sessions (no direct SELECT policy).

CREATE POLICY sessions_instructor_update_own
ON public.sessions
FOR UPDATE
TO authenticated
USING (
  public.is_approved_instructor()
  AND public.instructor_owns_session(id)
)
WITH CHECK (
  public.is_approved_instructor()
  AND public.instructor_owns_session(id)
);

-- audit_log (append by authenticated actors; read admin only)
CREATE POLICY audit_log_select_admin
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY audit_log_insert_authenticated
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid());

-- notification_subscriptions
CREATE POLICY notification_subscriptions_select_own
ON public.notification_subscriptions
FOR SELECT
TO authenticated
USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY notification_subscriptions_insert_own
ON public.notification_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_subscriptions_update_own
ON public.notification_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_subscriptions_delete_own
ON public.notification_subscriptions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY notification_subscriptions_admin_all
ON public.notification_subscriptions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- notification_log (admin read; writes via service role / backend jobs)
CREATE POLICY notification_log_select_admin
ON public.notification_log
FOR SELECT
TO authenticated
USING (public.is_admin());

GRANT SELECT ON public.instructor_sessions TO authenticated;

-- Grants for authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.instructors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.institutions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.primary_suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.sessions TO authenticated;
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_subscriptions TO authenticated;
GRANT SELECT ON public.notification_log TO authenticated;

GRANT USAGE ON TYPE public.user_role TO authenticated;
GRANT USAGE ON TYPE public.approval_status TO authenticated;
GRANT USAGE ON TYPE public.course_status TO authenticated;
GRANT USAGE ON TYPE public.session_status TO authenticated;
GRANT USAGE ON TYPE public.audit_action TO authenticated;
GRANT USAGE ON TYPE public.audit_entity TO authenticated;
GRANT USAGE ON TYPE public.notification_type TO authenticated;
