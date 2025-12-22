-- Fix views to use SECURITY INVOKER (caller's permissions, not creator's)
-- This ensures RLS policies are properly enforced

DROP VIEW IF EXISTS public.subscriptions_safe;
DROP VIEW IF EXISTS public.events_public;

-- Recreate subscriptions_safe view with SECURITY INVOKER
CREATE VIEW public.subscriptions_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  events_limit,
  templates_limit,
  downloads_limit,
  downloads_used,
  created_at,
  updated_at
FROM public.subscriptions;

GRANT SELECT ON public.subscriptions_safe TO authenticated;

-- Recreate events_public view with SECURITY INVOKER
CREATE VIEW public.events_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  slug,
  description,
  location,
  start_date,
  end_date,
  brand_primary_color,
  brand_secondary_color,
  brand_text_color,
  logo_url,
  secondary_logo_url,
  layout_preset,
  hero_title,
  hero_subtitle,
  helper_text,
  favicon_url,
  homepage_url,
  instagram_url,
  linkedin_url,
  photo_folder_button_text,
  photo_folder_button_url,
  photo_folder_button_color,
  photo_folder_button_opacity,
  created_at
FROM public.events;

GRANT SELECT ON public.events_public TO anon, authenticated;