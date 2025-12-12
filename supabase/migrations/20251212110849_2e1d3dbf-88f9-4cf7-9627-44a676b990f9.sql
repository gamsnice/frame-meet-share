-- Add photo folder button color field to events table
ALTER TABLE public.events 
ADD COLUMN photo_folder_button_color TEXT DEFAULT NULL;