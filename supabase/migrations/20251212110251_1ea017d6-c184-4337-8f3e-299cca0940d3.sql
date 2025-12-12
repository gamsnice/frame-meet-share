-- Add photo folder button fields to events table
ALTER TABLE public.events 
ADD COLUMN photo_folder_button_text TEXT DEFAULT NULL,
ADD COLUMN photo_folder_button_url TEXT DEFAULT NULL;