-- Recognize all configured admin emails in RLS (not only legacy single admin_email()).

CREATE OR REPLACE FUNCTION public.admin_emails()
RETURNS TEXT[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ARRAY['almogg57@gmail.com', 'shimi.adda@gmail.com']::TEXT[];
$$;

CREATE OR REPLACE FUNCTION public.super_admin_email()
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'almogg57@gmail.com'::TEXT;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND LOWER(p.email) = public.super_admin_email()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND LOWER(p.email) = ANY (
        SELECT LOWER(unnest(public.admin_emails()))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.enforce_profile_admin_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_email TEXT;
  allowed_admin BOOLEAN;
BEGIN
  normalized_email := LOWER(BTRIM(NEW.email));
  allowed_admin := normalized_email = ANY (
    SELECT LOWER(unnest(public.admin_emails()))
  );

  IF NEW.role = 'admin' AND NOT allowed_admin THEN
    RAISE EXCEPTION 'Only configured admin emails can have admin role';
  END IF;

  IF allowed_admin THEN
    NEW.role := 'admin';
    NEW.approval_status := 'approved';
    NEW.notifications_enabled := TRUE;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT;
  meta_full_name TEXT;
  meta_phone TEXT;
  is_admin_user BOOLEAN;
BEGIN
  normalized_email := LOWER(BTRIM(NEW.email));
  meta_full_name := NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), '');
  meta_phone := NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'phone'), '');
  is_admin_user := normalized_email = ANY (
    SELECT LOWER(unnest(public.admin_emails()))
  );

  INSERT INTO public.profiles (id, email, role, approval_status, notifications_enabled)
  VALUES (
    NEW.id,
    normalized_email,
    CASE WHEN is_admin_user THEN 'admin'::public.user_role ELSE 'instructor'::public.user_role END,
    CASE WHEN is_admin_user THEN 'approved'::public.approval_status ELSE 'pending'::public.approval_status END,
    CASE WHEN is_admin_user THEN TRUE ELSE FALSE END
  );

  IF
    NOT is_admin_user
    AND meta_full_name IS NOT NULL
    AND meta_phone IS NOT NULL
  THEN
    INSERT INTO public.instructors (user_id, full_name, phone, email, color)
    VALUES (
      NEW.id,
      meta_full_name,
      meta_phone,
      normalized_email,
      '#2563EB'
    )
    ON CONFLICT (email) DO UPDATE
    SET
      user_id = EXCLUDED.user_id,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone
    WHERE public.instructors.user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_emails() TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
