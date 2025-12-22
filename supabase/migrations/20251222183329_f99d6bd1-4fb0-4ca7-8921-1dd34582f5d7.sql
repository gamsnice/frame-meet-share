-- Update promote_to_super_admin function to add email whitelist
CREATE OR REPLACE FUNCTION public.promote_to_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
  super_admin_count int;
  allowed_emails text[] := ARRAY['valentin@skinnovation.at', 'valentin.spoerk@outlook.com'];
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO current_user_email 
  FROM auth.users 
  WHERE id = current_user_id;
  
  -- Check if email is in whitelist
  IF current_user_email IS NULL OR NOT (current_user_email = ANY(allowed_emails)) THEN
    RETURN false;
  END IF;
  
  -- Check if any super_admin exists
  SELECT COUNT(*) INTO super_admin_count
  FROM public.user_roles
  WHERE role = 'super_admin';
  
  -- Only allow promotion if no super_admin exists
  IF super_admin_count > 0 THEN
    RETURN false;
  END IF;
  
  -- Delete existing role for this user (if any)
  DELETE FROM public.user_roles WHERE user_id = current_user_id;
  
  -- Insert super_admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'super_admin');
  
  RETURN true;
END;
$$;