ALTER TABLE apps
  ADD COLUMN IF NOT EXISTS name TEXT NULL,
  ADD COLUMN IF NOT EXISTS icon_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS icon_image_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

INSERT INTO storage.buckets (id, name, public)
VALUES ('app-icons', 'app-icons', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own app icons"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'app-icons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own app icons"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'app-icons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own app icons"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'app-icons' AND auth.uid()::text = (storage.foldername(name))[1]);
