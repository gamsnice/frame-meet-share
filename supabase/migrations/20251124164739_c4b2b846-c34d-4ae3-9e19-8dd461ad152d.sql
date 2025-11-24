-- Fix RLS policies for users table to allow registration
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Allow users to insert their own profile during registration
CREATE POLICY "Users can create their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Allow users to view their own data
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);