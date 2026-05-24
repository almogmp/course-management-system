-- Attendance tracking + operational session progress statuses

ALTER TYPE public.session_status ADD VALUE IF NOT EXISTS 'arrived';
ALTER TYPE public.session_status ADD VALUE IF NOT EXISTS 'in_progress';

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS actual_arrival_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;

COMMENT ON COLUMN public.sessions.actual_arrival_time IS 'Instructor-confirmed arrival (does not replace planned start_time)';
COMMENT ON COLUMN public.sessions.actual_start_time IS 'Instructor-confirmed session start';
COMMENT ON COLUMN public.sessions.actual_end_time IS 'Instructor-confirmed session end';

DROP VIEW IF EXISTS public.instructor_sessions;

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
  s.actual_arrival_time,
  s.actual_start_time,
  s.actual_end_time,
  s.created_at,
  s.updated_at
FROM public.sessions AS s
INNER JOIN public.courses AS c ON c.id = s.course_id
WHERE public.instructor_sessions_row_access(s.id);

COMMENT ON VIEW public.instructor_sessions IS
  'Instructor-visible session columns only — instructors must not query sessions directly';

GRANT SELECT ON public.instructor_sessions TO authenticated;

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

  IF NEW.status = 'cancelled' THEN
    RAISE EXCEPTION 'Instructor cannot cancel directly — request approval instead';
  END IF;

  IF NEW.status NOT IN ('arrived', 'in_progress', 'completed', 'deferred') THEN
    RAISE EXCEPTION 'Instructor cannot set this session status';
  END IF;

  IF NEW.status = 'deferred'
    AND (NEW.cancellation_reason IS NULL OR BTRIM(NEW.cancellation_reason) = '') THEN
    RAISE EXCEPTION 'Cancellation reason is required for approval request';
  END IF;

  IF NEW.status = 'arrived' AND OLD.status <> 'planned' THEN
    RAISE EXCEPTION 'Arrival can only be confirmed from planned status';
  END IF;

  IF NEW.status = 'in_progress' AND OLD.status <> 'arrived' THEN
    RAISE EXCEPTION 'Session can only start after arrival is confirmed';
  END IF;

  IF NEW.status = 'completed' AND OLD.status NOT IN ('in_progress', 'planned', 'arrived') THEN
    RAISE EXCEPTION 'Invalid transition to completed';
  END IF;

  IF NEW.status = 'completed'
    AND OLD.status <> 'in_progress'
    AND (NEW.session_date + NEW.end_time) > LOCALTIMESTAMP THEN
    RAISE EXCEPTION 'Cannot mark completed before session end unless session was in progress';
  END IF;

  IF NEW.status = 'deferred' AND OLD.status <> 'planned' THEN
    RAISE EXCEPTION 'Cancellation can only be requested from planned status';
  END IF;

  NEW.status_marked_at := NOW();
  NEW.status_marked_by := auth.uid();

  RETURN NEW;
END;
$$;
