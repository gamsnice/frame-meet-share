-- Create subscription tier config table for super admin adjustable limits
CREATE TABLE public.subscription_tier_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier UNIQUE NOT NULL,
  downloads_limit integer NOT NULL,
  events_limit integer NOT NULL,
  templates_per_event_limit integer NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_tier_config ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage tier config
CREATE POLICY "Super admins can view tier config"
  ON public.subscription_tier_config FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update tier config"
  ON public.subscription_tier_config FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert tier config"
  ON public.subscription_tier_config FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Anyone can read tier config (needed for upgrade prompts)
CREATE POLICY "Anyone can view tier config for comparisons"
  ON public.subscription_tier_config FOR SELECT
  USING (true);

-- Insert default tier values
INSERT INTO public.subscription_tier_config (tier, downloads_limit, events_limit, templates_per_event_limit) VALUES
  ('free', 50, 1, 1),
  ('pro', 400, 5, 3),
  ('premium', 1000, -1, -1),
  ('starter', 100, 2, 2),
  ('enterprise', 5000, -1, -1);

-- Add downloads columns to subscriptions
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS downloads_limit integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS downloads_used integer DEFAULT 0;

-- Update existing subscriptions with correct limits based on tier
UPDATE public.subscriptions SET 
  downloads_limit = CASE 
    WHEN tier = 'free' THEN 50
    WHEN tier = 'starter' THEN 100
    WHEN tier = 'pro' THEN 400
    WHEN tier = 'premium' THEN 1000
    WHEN tier = 'enterprise' THEN 5000
    ELSE 50
  END,
  events_limit = CASE 
    WHEN tier = 'free' THEN 1
    WHEN tier = 'starter' THEN 2
    WHEN tier = 'pro' THEN 5
    WHEN tier IN ('premium', 'enterprise') THEN -1
    ELSE 1
  END,
  templates_per_event_limit = CASE 
    WHEN tier = 'free' THEN 1
    WHEN tier = 'starter' THEN 2
    WHEN tier = 'pro' THEN 3
    WHEN tier IN ('premium', 'enterprise') THEN -1
    ELSE 1
  END;

-- Create user usage stats table for permanent tracking
CREATE TABLE public.user_usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_downloads integer DEFAULT 0,
  total_events_created integer DEFAULT 0,
  total_templates_created integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_usage_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage stats"
  ON public.user_usage_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can view all usage stats
CREATE POLICY "Super admins can view all usage stats"
  ON public.user_usage_stats FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

-- System can insert/update usage stats (via triggers)
CREATE POLICY "System can manage usage stats"
  ON public.user_usage_stats FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update handle_new_user to create usage stats and set correct subscription limits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  INSERT INTO public.subscriptions (user_id, tier, status, downloads_limit, downloads_used, events_limit, templates_per_event_limit)
  VALUES (
    NEW.id, 
    'free', 
    'active',
    COALESCE(tier_config.downloads_limit, 50),
    0,
    COALESCE(tier_config.events_limit, 1),
    COALESCE(tier_config.templates_per_event_limit, 1)
  );
  
  -- Create usage stats record
  INSERT INTO public.user_usage_stats (user_id, total_downloads, total_events_created, total_templates_created)
  VALUES (NEW.id, 0, 0, 0);
  
  RETURN NEW;
END;
$$;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_subscription_limit(
  p_user_id uuid, 
  p_action text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub record;
  event_count integer;
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
    RETURN jsonb_build_object(
      'allowed', true,
      'limit', sub.templates_per_event_limit,
      'tier', sub.tier
    );
  END IF;
  
  RETURN jsonb_build_object('allowed', false, 'message', 'Unknown action');
END;
$$;

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_user_download(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
  sub record;
BEGIN
  SELECT owner_user_id INTO owner_id FROM events WHERE id = p_event_id;
  
  IF owner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Event not found');
  END IF;
  
  SELECT * INTO sub FROM subscriptions WHERE user_id = owner_id;
  
  IF sub IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No subscription found');
  END IF;
  
  IF sub.downloads_limit != -1 AND sub.downloads_used >= sub.downloads_limit THEN
    RETURN jsonb_build_object('success', false, 'message', 'Download limit reached', 'limit_reached', true);
  END IF;
  
  UPDATE subscriptions 
  SET downloads_used = downloads_used + 1 
  WHERE user_id = owner_id;
  
  UPDATE user_usage_stats 
  SET total_downloads = total_downloads + 1, updated_at = now()
  WHERE user_id = owner_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Trigger function for tracking event creation
CREATE OR REPLACE FUNCTION public.track_event_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_usage_stats (user_id, total_events_created)
  VALUES (NEW.owner_user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_events_created = user_usage_stats.total_events_created + 1,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger function for tracking template creation
CREATE OR REPLACE FUNCTION public.track_template_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT owner_user_id INTO owner_id FROM events WHERE id = NEW.event_id;
  
  IF owner_id IS NOT NULL THEN
    INSERT INTO user_usage_stats (user_id, total_templates_created)
    VALUES (owner_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_templates_created = user_usage_stats.total_templates_created + 1,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_event_created ON events;
CREATE TRIGGER on_event_created
  AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION track_event_creation();

DROP TRIGGER IF EXISTS on_template_created ON templates;
CREATE TRIGGER on_template_created
  AFTER INSERT ON templates
  FOR EACH ROW EXECUTE FUNCTION track_template_creation();

-- Initialize usage stats for existing users
INSERT INTO user_usage_stats (user_id, total_events_created, total_templates_created, total_downloads)
SELECT 
  u.id,
  COALESCE((SELECT COUNT(*) FROM events WHERE owner_user_id = u.id), 0),
  COALESCE((SELECT COUNT(*) FROM templates t JOIN events e ON t.event_id = e.id WHERE e.owner_user_id = u.id), 0),
  COALESCE((SELECT downloads_used FROM subscriptions WHERE user_id = u.id), 0)
FROM users u
ON CONFLICT (user_id) DO NOTHING;