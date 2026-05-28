-- Ensure instructor_sessions exposes institution name for instructor UI (no financial fields)
-- Safe: view-only change, no data mutation

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
  i.name AS institution_name,
  s.created_at,
  s.updated_at
FROM public.sessions AS s
INNER JOIN public.courses AS c ON c.id = s.course_id
LEFT JOIN public.institutions AS i ON i.id = c.institution_id
WHERE public.instructor_sessions_row_access(s.id);

COMMENT ON VIEW public.instructor_sessions IS
  'Instructor-visible sessions — includes effective instructor_hourly_rate and institution_name only; no institution billing rates or profit fields';

GRANT SELECT ON public.instructor_sessions TO authenticated;

