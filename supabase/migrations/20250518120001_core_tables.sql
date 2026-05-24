-- Core tables, foreign keys, and indexes

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.user_role NOT NULL,
  approval_status public.approval_status NOT NULL DEFAULT 'pending',
  notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_email_unique UNIQUE (email),
  CONSTRAINT profiles_email_lowercase CHECK (email = LOWER(email))
);

CREATE TABLE public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT instructors_email_unique UNIQUE (email),
  CONSTRAINT instructors_email_lowercase CHECK (email = LOWER(email)),
  CONSTRAINT instructors_user_id_unique UNIQUE (user_id),
  CONSTRAINT instructors_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  coordinator TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.primary_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT primary_suppliers_email_lowercase CHECK (email = LOWER(email))
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_id UUID NOT NULL REFERENCES public.institutions (id) ON DELETE RESTRICT,
  primary_supplier_id UUID NOT NULL REFERENCES public.primary_suppliers (id) ON DELETE RESTRICT,
  coordinator TEXT NOT NULL,
  lead_instructor_id UUID NOT NULL REFERENCES public.instructors (id) ON DELETE RESTRICT,
  instructor_hourly_wage NUMERIC(10, 2) NOT NULL,
  company_hourly_rate NUMERIC(10, 2) NOT NULL,
  instructor_hours NUMERIC(8, 2) NOT NULL,
  company_hours NUMERIC(8, 2) NOT NULL,
  status public.course_status NOT NULL DEFAULT 'active',
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT courses_instructor_hourly_wage_positive CHECK (instructor_hourly_wage >= 0),
  CONSTRAINT courses_company_hourly_rate_positive CHECK (company_hourly_rate >= 0),
  CONSTRAINT courses_instructor_hours_positive CHECK (instructor_hours >= 0),
  CONSTRAINT courses_company_hours_positive CHECK (company_hours >= 0)
);

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  instructor_hours NUMERIC(8, 2) NOT NULL,
  company_hours NUMERIC(8, 2) NOT NULL,
  status public.session_status NOT NULL DEFAULT 'planned',
  admin_note TEXT,
  substitute_instructor_id UUID REFERENCES public.instructors (id) ON DELETE RESTRICT,
  cancellation_reason TEXT,
  status_marked_at TIMESTAMPTZ,
  status_marked_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sessions_end_after_start CHECK (end_time > start_time),
  CONSTRAINT sessions_instructor_hours_positive CHECK (instructor_hours >= 0),
  CONSTRAINT sessions_company_hours_positive CHECK (company_hours >= 0),
  CONSTRAINT sessions_cancellation_reason_when_cancelled CHECK (
    status <> 'cancelled'
    OR (cancellation_reason IS NOT NULL AND BTRIM(cancellation_reason) <> '')
  )
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  action public.audit_action NOT NULL,
  entity_type public.audit_entity NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_subscriptions_endpoint_unique UNIQUE (endpoint)
);

CREATE TABLE public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions (id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE
);

CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_role_approval ON public.profiles (role, approval_status);

CREATE INDEX idx_instructors_user_id ON public.instructors (user_id);
CREATE INDEX idx_instructors_email ON public.instructors (email);

CREATE INDEX idx_courses_institution_id ON public.courses (institution_id);
CREATE INDEX idx_courses_primary_supplier_id ON public.courses (primary_supplier_id);
CREATE INDEX idx_courses_lead_instructor_id ON public.courses (lead_instructor_id);
CREATE INDEX idx_courses_status_school_year ON public.courses (status, school_year);

CREATE INDEX idx_sessions_course_id ON public.sessions (course_id);
CREATE INDEX idx_sessions_session_date_status ON public.sessions (session_date, status);
CREATE INDEX idx_sessions_school_year ON public.sessions (school_year);
CREATE INDEX idx_sessions_substitute_instructor_id ON public.sessions (substitute_instructor_id);

CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.audit_log (entity_type, entity_id);

CREATE INDEX idx_notification_log_session_type ON public.notification_log (session_id, notification_type);
CREATE INDEX idx_notification_log_recipient ON public.notification_log (recipient_profile_id);

COMMENT ON TABLE public.profiles IS 'App users linked to auth.users; role and access gates';
COMMENT ON TABLE public.instructors IS 'Instructor master data — no salary (wage is on course only)';
COMMENT ON TABLE public.courses IS 'Courses — no hard delete; use status only';
COMMENT ON TABLE public.sessions IS 'Meetings — created manually by admin only';