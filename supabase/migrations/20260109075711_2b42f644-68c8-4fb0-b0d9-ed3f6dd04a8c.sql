-- Create linkedin_tokens table for storing OAuth tokens (server-side only)
CREATE TABLE public.linkedin_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  access_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  linkedin_urn text NOT NULL,
  linkedin_name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS - no policies means only service role can access
ALTER TABLE public.linkedin_tokens ENABLE ROW LEVEL SECURITY;

-- Create linkedin_oauth_states table for CSRF protection
CREATE TABLE public.linkedin_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text UNIQUE NOT NULL,
  session_id text NOT NULL,
  redirect_uri text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '10 minutes')
);

-- Enable RLS - no policies means only service role can access
ALTER TABLE public.linkedin_oauth_states ENABLE ROW LEVEL SECURITY;

-- Create index for cleanup of expired states
CREATE INDEX idx_linkedin_oauth_states_expires_at ON public.linkedin_oauth_states(expires_at);

-- Create index for token lookup by session
CREATE INDEX idx_linkedin_tokens_session_id ON public.linkedin_tokens(session_id);
CREATE INDEX idx_linkedin_tokens_expires_at ON public.linkedin_tokens(expires_at);