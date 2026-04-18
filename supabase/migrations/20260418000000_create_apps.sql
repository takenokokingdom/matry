CREATE TABLE apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のアプリのみ参照" ON apps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "自分のアプリのみ作成" ON apps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のアプリのみ削除" ON apps FOR DELETE USING (auth.uid() = user_id);
