-- Instructor session status updates via SECURITY DEFINER RPC (bypasses sessions RLS on UPDATE).

CREATE OR REPLACE FUNCTION public.instructor_assigned_to_session(p_session_id UUID)
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
      AND (
        c.lead_instructor_id = public.current_instructor_id()
        OR s.substitute_instructor_id = public.current_instructor_id()
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.update_instructor_session_status(
  p_session_id UUID,
  p_course_id UUID,
  p_status TEXT
)
RETURNS TABLE (id UUID, status public.session_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_instructor_id UUID;
  v_session public.sessions%ROWTYPE;
  v_lead_instructor_id UUID;
  v_new_status public.session_status;
  v_session_start TIMESTAMP;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'יש להתחבר מחדש.' USING ERRCODE = 'P0001';
  END IF;

  IF p_status IS NULL OR BTRIM(p_status) = '' THEN
    RAISE EXCEPTION 'סטטוס מפגש אינו תקין.' USING ERRCODE = 'P0001';
  END IF;

  IF BTRIM(p_status) NOT IN ('planned', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'מדריך יכול לעדכן רק לסטטוס מתוכנן, בוצע או בוטל.' USING ERRCODE = 'P0001';
  END IF;

  v_new_status := BTRIM(p_status)::public.session_status;

  SELECT i.id
  INTO v_instructor_id
  FROM public.instructors AS i
  INNER JOIN public.profiles AS p ON p.id = i.user_id
  WHERE i.user_id = v_user_id
    AND i.is_active = TRUE
    AND p.role = 'instructor'
    AND p.approval_status = 'approved'
  LIMIT 1;

  IF v_instructor_id IS NULL THEN
    RAISE EXCEPTION 'לא נמצא פרופיל מדריך מאושר.' USING ERRCODE = 'P0001';
  END IF;

  SELECT s.*
  INTO v_session
  FROM public.sessions AS s
  WHERE s.id = p_session_id
    AND s.course_id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'לא נמצאה הרשאה לעדכן את המפגש או שהמפגש לא נמצא.' USING ERRCODE = 'P0001';
  END IF;

  SELECT c.lead_instructor_id
  INTO v_lead_instructor_id
  FROM public.courses AS c
  WHERE c.id = p_course_id;

  IF v_lead_instructor_id IS DISTINCT FROM v_instructor_id
     AND v_session.substitute_instructor_id IS DISTINCT FROM v_instructor_id THEN
    RAISE EXCEPTION 'אין הרשאה לעדכן מפגש זה.' USING ERRCODE = 'P0001';
  END IF;

  v_session_start := v_session.session_date + v_session.start_time;

  IF v_session_start > LOCALTIMESTAMP THEN
    RAISE EXCEPTION 'מוקדם מדי לעדכן את סטטוס המפגש' USING ERRCODE = 'P0001';
  END IF;

  IF v_new_status = 'completed' AND v_session.status = 'cancelled' THEN
    RAISE EXCEPTION 'לא ניתן לסמן מפגש מבוטל כבוצע.' USING ERRCODE = 'P0001';
  END IF;

  IF v_new_status = 'cancelled' THEN
    IF v_session.cancellation_reason IS NULL OR BTRIM(v_session.cancellation_reason) = '' THEN
      v_session.cancellation_reason := 'בוטל על ידי מדריך';
    END IF;
  ELSIF v_new_status = 'planned' THEN
    v_session.cancellation_reason := NULL;
    v_session.actual_arrival_time := NULL;
    v_session.actual_start_time := NULL;
    v_session.actual_end_time := NULL;
  ELSIF v_new_status = 'completed' THEN
    IF v_session.actual_end_time IS NULL THEN
      v_session.actual_end_time := NOW();
    END IF;
  END IF;

  v_session.status := v_new_status;
  v_session.status_marked_at := NOW();
  v_session.status_marked_by := v_user_id;
  v_session.updated_at := NOW();

  UPDATE public.sessions AS s
  SET
    status = v_session.status,
    cancellation_reason = v_session.cancellation_reason,
    actual_arrival_time = v_session.actual_arrival_time,
    actual_start_time = v_session.actual_start_time,
    actual_end_time = v_session.actual_end_time,
    status_marked_at = v_session.status_marked_at,
    status_marked_by = v_session.status_marked_by,
    updated_at = v_session.updated_at
  WHERE s.id = p_session_id
    AND s.course_id = p_course_id;

  RETURN QUERY
  SELECT p_session_id, v_new_status;
END;
$$;

COMMENT ON FUNCTION public.update_instructor_session_status(UUID, UUID, TEXT) IS
  'Instructor-only simple status update (planned/completed/cancelled) after session start; bypasses RLS';

GRANT EXECUTE ON FUNCTION public.instructor_assigned_to_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_instructor_session_status(UUID, UUID, TEXT) TO authenticated;

-- Align trigger ownership with RPC (lead OR substitute), not only effective substitute.
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

  IF NOT public.instructor_assigned_to_session(OLD.id) THEN
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
