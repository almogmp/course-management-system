-- Extensions and enum types for course management system

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.user_role AS ENUM ('admin', 'instructor');

CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.course_status AS ENUM ('active', 'frozen', 'ended');

CREATE TYPE public.session_status AS ENUM ('planned', 'completed', 'cancelled', 'deferred');

CREATE TYPE public.audit_action AS ENUM (
  'create',
  'update',
  'cancel',
  'defer',
  'change_instructor',
  'change_hours',
  'add_session',
  'change_status',
  'approve_instructor',
  'reject_instructor'
);

CREATE TYPE public.audit_entity AS ENUM (
  'profile',
  'instructor',
  'institution',
  'primary_supplier',
  'course',
  'session'
);

CREATE TYPE public.notification_type AS ENUM (
  'instructor_unmarked_reminder',
  'admin_unmarked_alert'
);

COMMENT ON TYPE public.user_role IS 'admin | instructor — admin only for almogg57@gmail.com';
COMMENT ON TYPE public.course_status IS 'active (פעיל) | frozen (מוקפא) | ended (הסתיים)';
COMMENT ON TYPE public.session_status IS 'planned (מתוכנן) | completed (בוצע) | cancelled (בוטל) | deferred (נדחה)';
