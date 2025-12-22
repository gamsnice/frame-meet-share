-- 1. Fix user_usage_stats RLS - Remove overly permissive policy
DROP POLICY IF EXISTS "System can manage usage stats" ON public.user_usage_stats;

-- The existing triggers (track_event_creation, track_template_creation) and 
-- RPC function (increment_user_download) use SECURITY DEFINER so they don't need RLS

-- 2. Create safe subscriptions view (excludes Stripe IDs)
CREATE OR REPLACE VIEW public.subscriptions_safe AS
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

-- Grant access to the view
GRANT SELECT ON public.subscriptions_safe TO authenticated;

-- 3. Create public events view (excludes owner_user_id for public access)
CREATE OR REPLACE VIEW public.events_public AS
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

-- Grant access to the view
GRANT SELECT ON public.events_public TO anon, authenticated;

-- 4. Add path-based storage policies for event-assets bucket
-- First, drop existing overly permissive policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Create function to check if user owns an event
CREATE OR REPLACE FUNCTION public.user_owns_event(event_id_text text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events
    WHERE id::text = event_id_text
      AND owner_user_id = auth.uid()
  )
$$;

-- Policy: Users can upload to their own event folders
CREATE POLICY "Users can upload to own event folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-assets' AND
  public.user_owns_event(SPLIT_PART(name, '/', 1))
);

-- Policy: Users can update files in their own event folders
CREATE POLICY "Users can update own event files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-assets' AND
  public.user_owns_event(SPLIT_PART(name, '/', 1))
);

-- Policy: Users can delete files in their own event folders
CREATE POLICY "Users can delete own event files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-assets' AND
  public.user_owns_event(SPLIT_PART(name, '/', 1))
);