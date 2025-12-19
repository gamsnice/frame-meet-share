-- Create a function to promote the first user to super_admin (only if none exist)
CREATE OR REPLACE FUNCTION public.promote_to_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  super_admin_count int;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
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