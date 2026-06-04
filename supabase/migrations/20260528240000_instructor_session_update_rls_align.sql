-- Align instructor session UPDATE with instructor_sessions visibility.
-- Ensures instructor_owns_session matches view access (no school_year gate).
-- Re-applies trigger without "completed before session end" block.

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

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF (OLD.session_date + OLD.start_time) > LOCALTIMESTAMP THEN
      RAISE EXCEPTION 'מוקדם מדי לעדכן את סטטוס המפגש';
    END IF;

    IF NEW.status NOT IN ('planned', 'completed', 'cancelled') THEN
      RAISE EXCEPTION 'Instructor cannot set this session status';
    END IF;
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

  IF NEW.status = 'cancelled' THEN
    IF NEW.cancellation_reason IS NULL OR BTRIM(NEW.cancellation_reason) = '' THEN
      RAISE EXCEPTION 'Cancellation reason is required';
    END IF;
  END IF;

  IF NEW.status = 'completed' AND OLD.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot mark cancelled session as completed';
  END IF;

  NEW.status_marked_at := NOW();
  NEW.status_marked_by := auth.uid();

  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS sessions_instructor_update_own ON public.sessions;

CREATE POLICY sessions_instructor_update_own
ON public.sessions
FOR UPDATE
TO authenticated
USING (
  public.is_approved_instructor()
  AND public.instructor_sessions_row_access(id)
)
WITH CHECK (
  public.is_approved_instructor()
  AND public.instructor_sessions_row_access(id)
);

GRANT UPDATE ON public.sessions TO authenticated;
