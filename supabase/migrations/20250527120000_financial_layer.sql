-- Financial layer: per-session rate overrides (course defaults remain company_hourly_rate / instructor_hourly_wage)

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS institution_hourly_rate NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS instructor_hourly_rate NUMERIC(10, 2);

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_institution_hourly_rate_non_negative
  CHECK (institution_hourly_rate IS NULL OR institution_hourly_rate >= 0),
  ADD CONSTRAINT sessions_instructor_hourly_rate_non_negative
  CHECK (instructor_hourly_rate IS NULL OR instructor_hourly_rate >= 0);

COMMENT ON COLUMN public.sessions.institution_hourly_rate IS
  'Optional override for institution billing rate (₪/hour); falls back to courses.company_hourly_rate';
COMMENT ON COLUMN public.sessions.instructor_hourly_rate IS
  'Optional override for instructor payout rate (₪/hour); falls back to courses.instructor_hourly_wage';

COMMENT ON COLUMN public.courses.company_hourly_rate IS
  'Default institution hourly rate (₪/hour) — revenue = company_hours × rate';
COMMENT ON COLUMN public.courses.instructor_hourly_wage IS
  'Default instructor hourly wage (₪/hour) — payout = instructor_hours × rate';

-- Instructor view: effective instructor rate only (no institution / company financials)
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
  COALESCE(s.instructor_hourly_rate, c.instructor_hourly_wage) AS instructor_hourly_rate,
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
  'Instructor-visible sessions — includes effective instructor_hourly_rate only; no institution revenue fields';

GRANT SELECT ON public.instructor_sessions TO authenticated;

-- Block instructors from changing financial override fields
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
