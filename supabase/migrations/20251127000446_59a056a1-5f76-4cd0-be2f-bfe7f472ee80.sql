-- Drop the restrictive type constraint to allow custom template types
ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_type_check;