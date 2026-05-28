-- Instructors may change session status only after session start time (admins bypass via is_admin()).

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

  IF NEW.status = 'completed' THEN
    IF OLD.status = 'cancelled' THEN
      RAISE EXCEPTION 'Cannot mark cancelled session as completed';
    END IF;
  END IF;

  NEW.status_marked_at := NOW();
  NEW.status_marked_by := auth.uid();

  RETURN NEW;
END;
$$;
