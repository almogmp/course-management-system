-- Coordinators per institution, course target hours, simplified instructor session updates

CREATE TABLE IF NOT EXISTS public.institution_coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institution_coordinators_institution_id
  ON public.institution_coordinators (institution_id);

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS coordinator_id UUID REFERENCES public.institution_coordinators (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_instructor_hours NUMERIC(8, 2);

ALTER TABLE public.courses
  ADD CONSTRAINT courses_target_instructor_hours_positive
  CHECK (target_instructor_hours IS NULL OR target_instructor_hours >= 0);

COMMENT ON COLUMN public.courses.target_instructor_hours IS 'Optional purchased/planned hour target for operational tracking';

-- RLS: admins manage coordinators; instructors read for course context
ALTER TABLE public.institution_coordinators ENABLE ROW LEVEL SECURITY;

CREATE POLICY institution_coordinators_select_authenticated
ON public.institution_coordinators
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY institution_coordinators_admin_write
ON public.institution_coordinators
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

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
