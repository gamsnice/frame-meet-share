-- Delete duplicate records, keeping only the first one and summing the counts
WITH duplicates AS (
  SELECT 
    id,
    event_id,
    template_id,
    date,
    ROW_NUMBER() OVER (
      PARTITION BY event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date 
      ORDER BY id
    ) as rn,
    SUM(views_count) OVER (
      PARTITION BY event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date
    ) as total_views,
    SUM(uploads_count) OVER (
      PARTITION BY event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date
    ) as total_uploads,
    SUM(downloads_count) OVER (
      PARTITION BY event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date
    ) as total_downloads,
    SUM(caption_copies_count) OVER (
      PARTITION BY event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date
    ) as total_caption_copies
  FROM event_stats_daily
)
UPDATE event_stats_daily
SET 
  views_count = duplicates.total_views,
  uploads_count = duplicates.total_uploads,
  downloads_count = duplicates.total_downloads,
  caption_copies_count = duplicates.total_caption_copies
FROM duplicates
WHERE event_stats_daily.id = duplicates.id AND duplicates.rn = 1;

-- Delete the duplicate records (keeping only rn=1)
DELETE FROM event_stats_daily
WHERE id IN (
  SELECT id 
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date 
        ORDER BY id
      ) as rn
    FROM event_stats_daily
  ) t
  WHERE t.rn > 1
);

-- Now create the unique constraint
CREATE UNIQUE INDEX event_stats_daily_unique_idx 
ON event_stats_daily (event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date);

-- Create function to atomically increment event stats
CREATE OR REPLACE FUNCTION public.increment_event_stat(
  p_event_id UUID,
  p_template_id UUID,
  p_stat_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO event_stats_daily (event_id, template_id, date, views_count, uploads_count, downloads_count, caption_copies_count)
  VALUES (
    p_event_id,
    p_template_id,
    CURRENT_DATE,
    CASE WHEN p_stat_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_stat_type = 'upload' THEN 1 ELSE 0 END,
    CASE WHEN p_stat_type = 'download' THEN 1 ELSE 0 END,
    CASE WHEN p_stat_type = 'caption_copy' THEN 1 ELSE 0 END
  )
  ON CONFLICT (event_id, COALESCE(template_id, '00000000-0000-0000-0000-000000000000'::uuid), date)
  DO UPDATE SET
    views_count = event_stats_daily.views_count + CASE WHEN p_stat_type = 'view' THEN 1 ELSE 0 END,
    uploads_count = event_stats_daily.uploads_count + CASE WHEN p_stat_type = 'upload' THEN 1 ELSE 0 END,
    downloads_count = event_stats_daily.downloads_count + CASE WHEN p_stat_type = 'download' THEN 1 ELSE 0 END,
    caption_copies_count = event_stats_daily.caption_copies_count + CASE WHEN p_stat_type = 'caption_copy' THEN 1 ELSE 0 END;
END;
$$;