-- Create placeholder_images table for library
CREATE TABLE public.placeholder_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.placeholder_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own placeholder images"
  ON public.placeholder_images FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own placeholder images"
  ON public.placeholder_images FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own placeholder images"
  ON public.placeholder_images FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Add placeholder_image_id to templates (foreign key with ON DELETE SET NULL)
ALTER TABLE public.templates 
ADD COLUMN placeholder_image_id UUID REFERENCES public.placeholder_images(id) ON DELETE SET NULL;

-- Migrate existing placeholder URLs to the new table
-- First, insert existing placeholders into the new table
INSERT INTO public.placeholder_images (user_id, image_url, original_filename)
SELECT DISTINCT
  e.owner_user_id,
  t.placeholder_image_url,
  'migrated_placeholder'
FROM public.templates t
JOIN public.events e ON t.event_id = e.id
WHERE t.placeholder_image_url IS NOT NULL;

-- Update templates to reference the new placeholder_images
UPDATE public.templates t
SET placeholder_image_id = pi.id
FROM public.placeholder_images pi
WHERE t.placeholder_image_url = pi.image_url
  AND t.placeholder_image_url IS NOT NULL;