-- Add file size limit (10MB) and MIME type restrictions to event-assets bucket
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon']
WHERE id = 'event-assets';