-- MeetMeFrame Database Schema

-- Users table (organizers)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  organization_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  location TEXT,
  brand_primary_color TEXT DEFAULT '#2563EB',
  brand_secondary_color TEXT DEFAULT '#F97316',
  brand_text_color TEXT DEFAULT '#FFFFFF',
  logo_url TEXT,
  secondary_logo_url TEXT,
  layout_preset TEXT DEFAULT 'A' CHECK (layout_preset IN ('A', 'B', 'C')),
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  helper_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Templates table with photo frame mapping
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SPEAKER', 'ATTENDEE', 'SPONSOR', 'CUSTOM')),
  format TEXT NOT NULL CHECK (format IN ('square', 'story', 'landscape', 'portrait')),
  image_url TEXT NOT NULL,
  photo_frame_x DECIMAL(3,2) NOT NULL CHECK (photo_frame_x >= 0 AND photo_frame_x <= 1),
  photo_frame_y DECIMAL(3,2) NOT NULL CHECK (photo_frame_y >= 0 AND photo_frame_y <= 1),
  photo_frame_width DECIMAL(3,2) NOT NULL CHECK (photo_frame_width >= 0 AND photo_frame_width <= 1),
  photo_frame_height DECIMAL(3,2) NOT NULL CHECK (photo_frame_height >= 0 AND photo_frame_height <= 1),
  photo_frame_shape TEXT DEFAULT 'RECT' CHECK (photo_frame_shape IN ('RECT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Template captions table
CREATE TABLE public.template_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  caption_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event stats daily table
CREATE TABLE public.event_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  uploads_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  caption_copies_count INTEGER DEFAULT 0,
  UNIQUE(event_id, template_id, date)
);

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (organizers can see their own data)
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- RLS Policies for events
CREATE POLICY "Organizers can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid()::text = owner_user_id::text);

CREATE POLICY "Anyone can view events by slug"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid()::text = owner_user_id::text);

CREATE POLICY "Organizers can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid()::text = owner_user_id::text);

CREATE POLICY "Organizers can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid()::text = owner_user_id::text);

-- RLS Policies for templates
CREATE POLICY "Anyone can view templates"
  ON public.templates FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create templates for their events"
  ON public.templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND owner_user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Organizers can update templates for their events"
  ON public.templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND owner_user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Organizers can delete templates for their events"
  ON public.templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND owner_user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for template_captions
CREATE POLICY "Anyone can view captions"
  ON public.template_captions FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage captions for their templates"
  ON public.template_captions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.templates t
      JOIN public.events e ON t.event_id = e.id
      WHERE t.id = template_id AND e.owner_user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for event_stats_daily (public can insert, organizers can view)
CREATE POLICY "Anyone can record stats"
  ON public.event_stats_daily FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Organizers can view stats for their events"
  ON public.event_stats_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND owner_user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for contact_messages
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Create storage bucket for event assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true);

-- Storage policies
CREATE POLICY "Anyone can view event assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-assets');

CREATE POLICY "Authenticated users can upload event assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own event assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own event assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-assets' AND auth.role() = 'authenticated');