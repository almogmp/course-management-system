-- יצירת רשומת מדריך אוטומטית בהרשמה (מטא-דאטה מ-signUp)
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
BEGIN
  normalized_email := LOWER(BTRIM(NEW.email));
  meta_full_name := NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), '');
  meta_phone := NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'phone'), '');

  INSERT INTO public.profiles (id, email, role, approval_status, notifications_enabled)
  VALUES (
    NEW.id,
    normalized_email,
    CASE
      WHEN normalized_email = public.admin_email() THEN 'admin'::public.user_role
      ELSE 'instructor'::public.user_role
    END,
    CASE
      WHEN normalized_email = public.admin_email() THEN 'approved'::public.approval_status
      ELSE 'pending'::public.approval_status
    END,
    FALSE
  );

  IF
    normalized_email <> public.admin_email()
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
