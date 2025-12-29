-- Remove public INSERT policies from stats tables
-- The SECURITY DEFINER RPC functions (increment_event_stat, increment_event_stat_hourly, increment_event_stat_quarter_hourly) will continue to work

DROP POLICY IF EXISTS "Anyone can record stats" ON event_stats_daily;
DROP POLICY IF EXISTS "Anyone can record hourly stats" ON event_stats_hourly;
DROP POLICY IF EXISTS "Anyone can record quarter-hourly stats" ON event_stats_quarter_hourly;