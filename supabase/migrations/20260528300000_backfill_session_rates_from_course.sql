-- Backfill missing session-level rates from course defaults.
-- Idempotent: only updates rows where session rate IS NULL (never overrides stored values).
-- Run once on deploy; safe to re-run (no-op when already filled).

UPDATE public.sessions AS s
SET institution_hourly_rate = c.company_hourly_rate
FROM public.courses AS c
WHERE s.course_id = c.id
  AND s.institution_hourly_rate IS NULL
  AND c.company_hourly_rate > 0;

UPDATE public.sessions AS s
SET instructor_hourly_rate = c.instructor_hourly_wage
FROM public.courses AS c
WHERE s.course_id = c.id
  AND s.instructor_hourly_rate IS NULL
  AND c.instructor_hourly_wage > 0;
