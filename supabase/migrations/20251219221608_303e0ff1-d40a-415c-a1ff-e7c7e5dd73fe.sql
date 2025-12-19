-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- Create user roles table (separate from users for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table (Stripe-ready)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  events_limit integer DEFAULT 1,
  templates_per_event_limit integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Update handle_new_user function to also create role and subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, email, name, organization_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', NULL)
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$;

-- Add status column to feedback for tracking resolution
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add read_at column to contact_messages for tracking
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Allow super admins to view all feedback
CREATE POLICY "Super admins can view all feedback"
  ON public.feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to update feedback status
CREATE POLICY "Super admins can update feedback"
  ON public.feedback FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to view contact messages
CREATE POLICY "Super admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to update contact messages
CREATE POLICY "Super admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to view all users
CREATE POLICY "Super admins can view all users"
  ON public.users FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to update all users
CREATE POLICY "Super admins can update all users"
  ON public.users FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to view all events
CREATE POLICY "Super admins can view all events"
  ON public.events FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super admins to view all event stats
CREATE POLICY "Super admins can view all daily stats"
  ON public.event_stats_daily FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can view all hourly stats"
  ON public.event_stats_hourly FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));