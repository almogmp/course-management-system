-- Fix instructor seeing zero sessions in instructor_sessions view.
--
-- Root causes:
-- 1) is_approved_instructor() required profiles.notifications_enabled = TRUE (default FALSE).
-- 2) instructor_owns_session() required sessions.school_year = active_school_year(today),
--    hiding assigned sessions in other years or with course/school_year mismatch.

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
      AND i.is_active = TRUE
  );
$$;

COMMENT ON FUNCTION public.is_approved_instructor() IS
  'Approved active instructor linked to auth user — notifications_enabled is not required for data access';

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
      AND public.current_instructor_id() IS NOT NULL
      AND public.session_effective_instructor_id(
        c.lead_instructor_id,
        s.substitute_instructor_id
      ) = public.current_instructor_id()
  );
$$;

COMMENT ON FUNCTION public.instructor_owns_session(UUID) IS
  'True when the logged-in instructor is lead or substitute on the session (any school_year)';

CREATE OR REPLACE FUNCTION public.enforce_instructor_session_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_approved_instructor() THEN
    RAISE EXCEPTION 'Instructor is not approved or is inactive';
  END IF;

  IF NOT public.instructor_owns_session(OLD.id) THEN
    RAISE EXCEPTION 'Instructor cannot update this session';
  END IF;

  IF (
    NEW.session_date,
    NEW.start_time,
    NEW.end_time,
    NEW.instructor_hours,
    NEW.company_hours,
    NEW.course_id,
    NEW.substitute_instructor_id,
    NEW.admin_note,
    NEW.school_year,
    NEW.institution_hourly_rate,
    NEW.instructor_hourly_rate
  ) IS DISTINCT FROM (
    OLD.session_date,
    OLD.start_time,
    OLD.end_time,
    OLD.instructor_hours,
    OLD.company_hours,
    OLD.course_id,
    OLD.substitute_instructor_id,
    OLD.admin_note,
    OLD.school_year,
    OLD.institution_hourly_rate,
    OLD.instructor_hourly_rate
  ) THEN
    RAISE EXCEPTION 'Instructor cannot modify session schedule, hours, course, substitute, admin note, or rates';
  END IF;

  IF NEW.status NOT IN ('planned', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Instructor cannot set this session status';
  END IF;

  IF NEW.status = 'cancelled' THEN
    IF NEW.cancellation_reason IS NULL OR BTRIM(NEW.cancellation_reason) = '' THEN
      RAISE EXCEPTION 'Cancellation reason is required';
    END IF;
  END IF;

  IF NEW.status = 'completed' THEN
    IF OLD.status = 'cancelled' THEN
      RAISE EXCEPTION 'Cannot mark cancelled session as completed';
    END IF;

    IF (NEW.session_date + NEW.end_time) > LOCALTIMESTAMP THEN
      RAISE EXCEPTION 'Cannot mark completed before session end';
    END IF;
  END IF;

  NEW.status_marked_at := NOW();
  NEW.status_marked_by := auth.uid();

  RETURN NEW;
END;
$$;
