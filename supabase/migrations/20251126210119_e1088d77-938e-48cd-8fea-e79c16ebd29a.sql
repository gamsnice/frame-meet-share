-- Add placeholder image columns to templates table
ALTER TABLE templates 
ADD COLUMN placeholder_image_url TEXT,
ADD COLUMN placeholder_scale NUMERIC DEFAULT 1,
ADD COLUMN placeholder_x NUMERIC DEFAULT 0,
ADD COLUMN placeholder_y NUMERIC DEFAULT 0;