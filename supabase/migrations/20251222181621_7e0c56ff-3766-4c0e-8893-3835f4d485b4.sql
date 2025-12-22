-- Drop the overly permissive policy that allows any authenticated user to view all feedback
-- This prevents email harvesting by restricting feedback access to super_admins only
DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.feedback;