-- Create new table for 15-minute interval stats
CREATE TABLE public.event_stats_quarter_hourly (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.templates(id) ON DELETE CASCADE,
  date date NOT NULL,
  hour integer NOT NULL CHECK (hour >= 0 AND hour < 24),
  quarter integer NOT NULL CHECK (quarter >= 0 AND quarter < 4),
  views_count integer DEFAULT 0,
  uploads_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  caption_copies_count integer DEFAULT 0,
  CONSTRAINT unique_event_template_date_hour_quarter UNIQUE (event_id, template_id, date, hour, quarter)
);

-- Create unique index for upsert operations (handles NULL template_id)
CREATE UNIQUE INDEX idx_event_stats_quarter_hourly_unique 
ON public.event_stats_quarter_hourly (
  event_id, 
  COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), 
  date, 
  hour, 
  quarter
);

-- Enable RLS
ALTER TABLE public.event_stats_quarter_hourly ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can record quarter-hourly stats" 
ON public.event_stats_quarter_hourly 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Organizers can view quarter-hourly stats for their events" 
ON public.event_stats_quarter_hourly 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_stats_quarter_hourly.event_id 
  AND events.owner_user_id::text = auth.uid()::text
));

CREATE POLICY "Super admins can view all quarter-hourly stats" 
ON public.event_stats_quarter_hourly 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create function to increment quarter-hourly stats
CREATE OR REPLACE FUNCTION public.increment_event_stat_quarter_hourly(
  p_event_id uuid, 
  p_template_id uuid, 
  p_stat_type text, 
  p_hour integer,
  p_quarter integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO event_stats_quarter_hourly (event_id, template_id, date, hour, quarter, views_count, uploads_count, downloads_count, caption_copies_count)
  VALUES (
    p_event_id,
    p_template_id,
    CURRENT_DATE,
    p_hour,
    p_quarter,
    CASE WHEN p_stat_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_stat_type = 'upload' THEN 1 ELSE 0 END,
    CASE WHEN p_stat_type = 'download' THEN 1 ELSE 0 END,
    CASE WHEN p_stat_type = 'caption_copy' THEN 1 ELSE 0 END
  )
  ON CONFLICT (event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date, hour, quarter)
  DO UPDATE SET
    views_count = event_stats_quarter_hourly.views_count + CASE WHEN p_stat_type = 'view' THEN 1 ELSE 0 END,
    uploads_count = event_stats_quarter_hourly.uploads_count + CASE WHEN p_stat_type = 'upload' THEN 1 ELSE 0 END,
    downloads_count = event_stats_quarter_hourly.downloads_count + CASE WHEN p_stat_type = 'download' THEN 1 ELSE 0 END,
    caption_copies_count = event_stats_quarter_hourly.caption_copies_count + CASE WHEN p_stat_type = 'caption_copy' THEN 1 ELSE 0 END;
END;
$$;

-- Update reset_event_stats to also reset quarter-hourly stats
CREATE OR REPLACE FUNCTION public.reset_event_stats(p_event_id uuid DEFAULT NULL::uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user owns the event
  IF p_event_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM events 
      WHERE id = p_event_id 
      AND owner_user_id::text = auth.uid()::text
    ) THEN
      RAISE EXCEPTION 'You do not have permission to reset stats for this event';
    END IF;
  END IF;

  -- Delete daily stats
  DELETE FROM event_stats_daily
  WHERE (p_event_id IS NULL OR event_id = p_event_id)
    AND (p_start_date IS NULL OR date >= p_start_date)
    AND (p_end_date IS NULL OR date <= p_end_date)
    AND EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_stats_daily.event_id 
      AND events.owner_user_id::text = auth.uid()::text
    );

  -- Delete hourly stats
  DELETE FROM event_stats_hourly
  WHERE (p_event_id IS NULL OR event_id = p_event_id)
    AND (p_start_date IS NULL OR date >= p_start_date)
    AND (p_end_date IS NULL OR date <= p_end_date)
    AND EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_stats_hourly.event_id 
      AND events.owner_user_id::text = auth.uid()::text
    );

  -- Delete quarter-hourly stats
  DELETE FROM event_stats_quarter_hourly
  WHERE (p_event_id IS NULL OR event_id = p_event_id)
    AND (p_start_date IS NULL OR date >= p_start_date)
    AND (p_end_date IS NULL OR date <= p_end_date)
    AND EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_stats_quarter_hourly.event_id 
      AND events.owner_user_id::text = auth.uid()::text
    );
END;
$$;