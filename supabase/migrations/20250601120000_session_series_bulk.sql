-- Bulk session series: metadata for recurring session groups

CREATE TABLE public.session_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekdays SMALLINT[] NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  assigned_instructor_id UUID NOT NULL REFERENCES public.instructors (id) ON DELETE RESTRICT,
  instructor_hours NUMERIC(8, 2) NOT NULL,
  company_hours NUMERIC(8, 2) NOT NULL,
  default_status public.session_status NOT NULL DEFAULT 'planned',
  institution_hourly_rate NUMERIC(10, 2),
  instructor_hourly_rate NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT session_series_end_after_start CHECK (end_date >= start_date),
  CONSTRAINT session_series_time_order CHECK (end_time > start_time),
  CONSTRAINT session_series_weekdays_nonempty CHECK (cardinality(weekdays) > 0),
  CONSTRAINT session_series_instructor_hours_positive CHECK (instructor_hours >= 0),
  CONSTRAINT session_series_company_hours_positive CHECK (company_hours >= 0)
);

COMMENT ON TABLE public.session_series IS 'Bulk-created session groups — admin-managed recurrence metadata';
COMMENT ON COLUMN public.session_series.weekdays IS '0=Sunday … 6=Saturday (JS Date.getDay())';

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.session_series (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_series_id ON public.sessions (series_id);
CREATE INDEX IF NOT EXISTS idx_session_series_course_id ON public.session_series (course_id);

CREATE TRIGGER set_session_series_updated_at
BEFORE UPDATE ON public.session_series
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.session_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_series FORCE ROW LEVEL SECURITY;

CREATE POLICY session_series_admin_select
ON public.session_series
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY session_series_admin_insert
ON public.session_series
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY session_series_admin_update
ON public.session_series
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY session_series_admin_delete
ON public.session_series
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_series TO authenticated;
