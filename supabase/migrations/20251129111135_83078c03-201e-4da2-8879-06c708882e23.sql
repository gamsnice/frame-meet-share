-- Add social media and homepage URL fields to events table
ALTER TABLE public.events 
ADD COLUMN homepage_url TEXT,
ADD COLUMN instagram_url TEXT,
ADD COLUMN linkedin_url TEXT;