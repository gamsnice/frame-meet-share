-- Fix foreign key constraint on event_stats_daily: Change from SET NULL to CASCADE
-- This ensures template-specific stats are deleted with the template, avoiding unique constraint violations

ALTER TABLE event_stats_daily 
DROP CONSTRAINT IF EXISTS event_stats_daily_template_id_fkey;

ALTER TABLE event_stats_daily 
ADD CONSTRAINT event_stats_daily_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES templates(id) 
ON DELETE CASCADE;

-- Fix event_stats_hourly: Change from SET NULL to CASCADE
ALTER TABLE event_stats_hourly 
DROP CONSTRAINT IF EXISTS event_stats_hourly_template_id_fkey;

ALTER TABLE event_stats_hourly 
ADD CONSTRAINT event_stats_hourly_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES templates(id) 
ON DELETE CASCADE;

-- Clean up any orphaned stats that reference non-existent templates
DELETE FROM event_stats_daily 
WHERE template_id IS NOT NULL 
AND template_id NOT IN (SELECT id FROM templates);

DELETE FROM event_stats_hourly 
WHERE template_id IS NOT NULL 
AND template_id NOT IN (SELECT id FROM templates);