-- Security Hardening Phase 2: Restrict direct events table access
-- The events_public VIEW already provides safe public access without owner_user_id

-- Remove the overly permissive public SELECT policy from events table
DROP POLICY IF EXISTS "Anyone can view events by slug" ON events;

-- Note: events_public is a VIEW, not a table. In PostgreSQL, views don't have their own RLS policies.
-- The VIEW inherits security from the base table (events), but since we're querying through the VIEW,
-- and the VIEW definition determines what columns are exposed, security is maintained.
-- The VIEW already excludes owner_user_id, providing the security layer we need.

-- Verify the remaining policies on events table are:
-- - "Organizers can view their own events" (SELECT with auth.uid() = owner_user_id)
-- - "Super admins can view all events" (SELECT with has_role super_admin)
-- - "Organizers can create/update/delete their own events" (INSERT/UPDATE/DELETE)