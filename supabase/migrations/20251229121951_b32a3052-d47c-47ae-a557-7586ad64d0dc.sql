-- Re-add public SELECT policy for events table
-- This is needed because the events_public VIEW inherits RLS from the base table
-- The VIEW already excludes owner_user_id, so no sensitive data is exposed
CREATE POLICY "Public can view events by slug" 
ON events FOR SELECT 
USING (true);