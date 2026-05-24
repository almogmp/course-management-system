-- Helper functions, auth hooks, and integrity triggers

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_email()
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'almogg57@gmail.com'::TEXT;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.email = public.admin_email()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_instructor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    INNER JOIN public.instructors AS i ON i.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'instructor'
      AND p.approval_status = 'approved'
      AND p.notifications_enabled = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.current_instructor_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id
  FROM public.instructors AS i
  WHERE i.user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.active_school_year(check_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  start_year INTEGER;
BEGIN
  IF EXTRACT(MONTH FROM check_date) >= 9 THEN
    start_year := EXTRACT(YEAR FROM check_date)::INTEGER;
  ELSE
    start_year := EXTRACT(YEAR FROM check_date)::INTEGER - 1;
  END IF;

  RETURN start_year::TEXT || '-' || (start_year + 1)::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.session_effective_instructor_id(
  p_lead_instructor_id UUID,
  p_substitute_instructor_id UUID
)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(p_substitute_instructor_id, p_lead_instructor_id);
$$;

CREATE OR REPLACE FUNCTION public.instructor_owns_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sessions AS s
    INNER JOIN public.courses AS c ON c.id = s.course_id
    WHERE s.id = p_session_id
      AND public.session_effective_instructor_id(
        c.lead_instructor_id,
        s.substitute_instructor_id
      ) = public.current_instructor_id()
      AND s.school_year = public.active_school_year()
  );
$$;

CREATE OR REPLACE FUNCTION public.instructor_sessions_row_access(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    OR (
      public.is_approved_instructor()
      AND public.instructor_owns_session(p_session_id)
    );
$$;

-- Instructor-safe read model (no company fields, no admin notes)
CREATE VIEW public.instructor_sessions AS
SELECT
  s.id,
  s.course_id,
  c.name AS course_name,
  s.session_date,
  s.start_time,
  s.end_time,
  s.instructor_hours,
  c.instructor_hourly_wage,
  s.status,
  s.cancellation_reason,
  s.substitute_instructor_id,
  s.school_year,
  s.status_marked_at,
  s.created_at,
  s.updated_at
FROM public.sessions AS s
INNER JOIN public.courses AS c ON c.id = s.course_id
WHERE public.instructor_sessions_row_access(s.id);

COMMENT ON VIEW public.instructor_sessions IS
  'Instructor-visible session columns only — instructors must not query sessions directly';

CREATE OR REPLACE FUNCTION public.enforce_profile_admin_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := LOWER(BTRIM(NEW.email));

  IF NEW.email = public.admin_email() THEN
    NEW.role := 'admin';
    NEW.approval_status := 'approved';
  ELSE
    IF NEW.role = 'admin' THEN
      RAISE EXCEPTION 'Only % can have admin role', public.admin_email();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT;
BEGIN
  normalized_email := LOWER(BTRIM(NEW.email));

  INSERT INTO public.profiles (id, email, role, approval_status, notifications_enabled)
  VALUES (
    NEW.id,
    normalized_email,
    CASE
      WHEN normalized_email = public.admin_email() THEN 'admin'::public.user_role
      ELSE 'instructor'::public.user_role
    END,
    CASE
      WHEN normalized_email = public.admin_email() THEN 'approved'::public.approval_status
      ELSE 'pending'::public.approval_status
    END,
    FALSE
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_instructor_session_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_approved_instructor() THEN
    RAISE EXCEPTION 'Instructor is not approved or notifications are disabled';
  END IF;

  IF NOT public.instructor_owns_session(OLD.id) THEN
    RAISE EXCEPTION 'Instructor cannot update this session';
  END IF;

  IF (NEW.session_date, NEW.start_time, NEW.end_time, NEW.instructor_hours, NEW.company_hours, NEW.course_id, NEW.substitute_instructor_id, NEW.admin_note, NEW.school_year)
    IS DISTINCT FROM
    (OLD.session_date, OLD.start_time, OLD.end_time, OLD.instructor_hours, OLD.company_hours, OLD.course_id, OLD.substitute_instructor_id, OLD.admin_note, OLD.school_year) THEN
    RAISE EXCEPTION 'Instructor cannot modify session schedule, hours, course, substitute, or admin note';
  END IF;

  IF NEW.status NOT IN ('completed', 'cancelled', 'deferred') THEN
    RAISE EXCEPTION 'Instructor can only set status to completed, cancelled, or deferred';
  END IF;

  IF NEW.status = 'cancelled'
    AND (NEW.cancellation_reason IS NULL OR BTRIM(NEW.cancellation_reason) = '') THEN
    RAISE EXCEPTION 'Cancellation reason is required';
  END IF;

  IF (NEW.session_date + NEW.end_time) > LOCALTIMESTAMP THEN
    RAISE EXCEPTION 'Cannot mark session before it has ended';
  END IF;

  NEW.status_marked_at := NOW();
  NEW.status_marked_by := auth.uid();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_session_school_year()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  course_year TEXT;
BEGIN
  SELECT c.school_year
  INTO course_year
  FROM public.courses AS c
  WHERE c.id = NEW.course_id;

  IF course_year IS NULL THEN
    RAISE EXCEPTION 'Course not found for session';
  END IF;

  NEW.school_year := course_year;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_instructors_updated_at
BEFORE UPDATE ON public.instructors
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_primary_suppliers_updated_at
BEFORE UPDATE ON public.primary_suppliers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_notification_subscriptions_updated_at
BEFORE UPDATE ON public.notification_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER enforce_profiles_admin_rules
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_admin_rules();

CREATE TRIGGER sync_sessions_school_year
BEFORE INSERT OR UPDATE OF course_id ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_session_school_year();

CREATE TRIGGER enforce_sessions_instructor_update
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_instructor_session_update();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved_instructor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_instructor_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.active_school_year(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.instructor_owns_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.instructor_sessions_row_access(UUID) TO authenticated;
