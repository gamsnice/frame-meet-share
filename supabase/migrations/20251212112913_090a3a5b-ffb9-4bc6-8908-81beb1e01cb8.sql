-- Add opacity column for photo folder button
ALTER TABLE public.events 
ADD COLUMN photo_folder_button_opacity NUMERIC DEFAULT 1.0;