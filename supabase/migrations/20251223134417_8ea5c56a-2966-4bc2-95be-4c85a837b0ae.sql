-- Update handle_new_user to set 1-year subscription period for free users
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tier_config record;
BEGIN
  -- Get free tier config
  SELECT * INTO tier_config FROM subscription_tier_config WHERE tier = 'free';
  
  -- Create user profile
  INSERT INTO public.users (id, email, name, organization_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', NULL)
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create free subscription with tier limits and 1-year period
  INSERT INTO public.subscriptions (
    user_id, 
    tier, 
    status, 
    downloads_limit, 
    downloads_used, 
    events_limit, 
    templates_limit,
    current_period_start,
    current_period_end
  )
  VALUES (
    NEW.id, 
    'free', 
    'active',
    COALESCE(tier_config.downloads_limit, 50),
    0,
    COALESCE(tier_config.events_limit, 1),
    COALESCE(tier_config.templates_limit, 1),
    now(),
    now() + interval '1 year'
  );
  
  -- Create usage stats record
  INSERT INTO public.user_usage_stats (user_id, total_downloads, total_events_created, total_templates_created)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$function$;