-- Rename column in subscription_tier_config
ALTER TABLE subscription_tier_config 
  RENAME COLUMN templates_per_event_limit TO templates_limit;

-- Rename column in subscriptions
ALTER TABLE subscriptions 
  RENAME COLUMN templates_per_event_limit TO templates_limit;

-- Update handle_new_user function to use new column name
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
  
  -- Create free subscription with tier limits
  INSERT INTO public.subscriptions (user_id, tier, status, downloads_limit, downloads_used, events_limit, templates_limit)
  VALUES (
    NEW.id, 
    'free', 
    'active',
    COALESCE(tier_config.downloads_limit, 50),
    0,
    COALESCE(tier_config.events_limit, 1),
    COALESCE(tier_config.templates_limit, 1)
  );
  
  -- Create usage stats record
  INSERT INTO public.user_usage_stats (user_id, total_downloads, total_events_created, total_templates_created)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$function$;

-- Update check_subscription_limit function to use new column name
CREATE OR REPLACE FUNCTION public.check_subscription_limit(p_user_id uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sub record;
  event_count integer;
  template_count integer;
BEGIN
  SELECT * INTO sub FROM subscriptions WHERE user_id = p_user_id;
  
  IF sub IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'message', 'No subscription found');
  END IF;
  
  IF p_action = 'download' THEN
    IF sub.downloads_limit = -1 THEN
      RETURN jsonb_build_object('allowed', true, 'current', sub.downloads_used, 'limit', -1, 'tier', sub.tier);
    END IF;
    RETURN jsonb_build_object(
      'allowed', sub.downloads_used < sub.downloads_limit,
      'current', sub.downloads_used,
      'limit', sub.downloads_limit,
      'tier', sub.tier
    );
    
  ELSIF p_action = 'create_event' THEN
    SELECT COUNT(*) INTO event_count FROM events WHERE owner_user_id = p_user_id;
    IF sub.events_limit = -1 THEN
      RETURN jsonb_build_object('allowed', true, 'current', event_count, 'limit', -1, 'tier', sub.tier);
    END IF;
    RETURN jsonb_build_object(
      'allowed', event_count < sub.events_limit,
      'current', event_count,
      'limit', sub.events_limit,
      'tier', sub.tier
    );
    
  ELSIF p_action = 'create_template' THEN
    -- Count total templates across all user's events
    SELECT COUNT(*) INTO template_count 
    FROM templates t
    JOIN events e ON t.event_id = e.id
    WHERE e.owner_user_id = p_user_id;
    
    IF sub.templates_limit = -1 THEN
      RETURN jsonb_build_object('allowed', true, 'current', template_count, 'limit', -1, 'tier', sub.tier);
    END IF;
    RETURN jsonb_build_object(
      'allowed', template_count < sub.templates_limit,
      'current', template_count,
      'limit', sub.templates_limit,
      'tier', sub.tier
    );
  END IF;
  
  RETURN jsonb_build_object('allowed', false, 'message', 'Unknown action');
END;
$function$;