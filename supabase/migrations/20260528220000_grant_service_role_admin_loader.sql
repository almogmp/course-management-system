-- Grant table privileges to service_role for server-side admin loaders (service role key).
-- RLS is bypassed for service_role in Supabase, but PostgreSQL still requires table GRANTs.
-- authenticated/anon grants are unchanged; this does not grant anon.

GRANT USAGE ON SCHEMA public TO service_role;

-- Admin instructors page + related loaders (read)
GRANT SELECT ON public.instructors TO service_role;
GRANT SELECT ON public.profiles TO service_role;
GRANT SELECT ON public.courses TO service_role;
GRANT SELECT ON public.sessions TO service_role;
GRANT SELECT ON public.primary_suppliers TO service_role;
GRANT SELECT ON public.institutions TO service_role;
GRANT SELECT ON public.institution_coordinators TO service_role;

-- Password / profile linking (server-side admin flows)
GRANT UPDATE ON public.instructors TO service_role;
GRANT INSERT, UPDATE ON public.profiles TO service_role;
