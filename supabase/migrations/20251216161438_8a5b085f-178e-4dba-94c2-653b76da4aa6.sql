-- Create feedback table for user feedback and bug reports
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  event_slug TEXT,
  feedback_type TEXT NOT NULL DEFAULT 'feedback',
  message TEXT NOT NULL,
  email TEXT,
  page_url TEXT
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (public insert)
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view feedback (for admin dashboard later)
CREATE POLICY "Authenticated users can view feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add constraint for feedback_type
ALTER TABLE public.feedback
ADD CONSTRAINT feedback_type_check
CHECK (feedback_type IN ('feedback', 'bug_report'));