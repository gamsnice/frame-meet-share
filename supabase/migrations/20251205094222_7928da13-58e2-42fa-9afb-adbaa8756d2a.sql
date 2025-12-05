-- Fix foreign key constraint on event_stats_daily to allow template deletion
-- Change from NO ACTION to SET NULL to preserve historical analytics

ALTER TABLE event_stats_daily 
DROP CONSTRAINT IF EXISTS event_stats_daily_template_id_fkey;

ALTER TABLE event_stats_daily 
ADD CONSTRAINT event_stats_daily_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES templates(id) 
ON DELETE SET NULL;

-- Also fix event_stats_hourly to ensure consistent behavior
ALTER TABLE event_stats_hourly 
DROP CONSTRAINT IF EXISTS event_stats_hourly_template_id_fkey;

ALTER TABLE event_stats_hourly 
ADD CONSTRAINT event_stats_hourly_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES templates(id) 
ON DELETE SET NULL;

-- Add cascade delete for template_captions (captions should be deleted with template)
ALTER TABLE template_captions 
DROP CONSTRAINT IF EXISTS template_captions_template_id_fkey;

ALTER TABLE template_captions 
ADD CONSTRAINT template_captions_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES templates(id) 
ON DELETE CASCADE;