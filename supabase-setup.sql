-- ============================================
-- DMSB Website - Complete Supabase Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  gallery_images TEXT[],
  images TEXT[],
  video_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  idempotency_key UUID,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- Site Content
-- id is a fixed TEXT key so the app can reliably upsert the singleton row.
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'site-singleton',
  vision TEXT NOT NULL DEFAULT '',
  mission TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  extra_content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Faculty
-- Uses 'role' and 'sort_order' to match the siteInfoService column names.
CREATE TABLE IF NOT EXISTS faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure idempotency support exists on older installations.
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_idempotency_key_unique
  ON posts(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE INDEX IF NOT EXISTS idx_faculty_order ON faculty(sort_order);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES - PUBLIC READ
-- ============================================

-- Posts: Public can read published posts
CREATE POLICY "Public read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Categories: Public can read all
CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (true);

-- Testimonials: Public can read approved only
CREATE POLICY "Public read approved testimonials"
  ON testimonials FOR SELECT
  USING (status = 'approved');

-- Site content: Public can read all
CREATE POLICY "Public read site content"
  ON site_content FOR SELECT
  USING (true);

-- Faculty: Public can read all
CREATE POLICY "Public read faculty"
  ON faculty FOR SELECT
  USING (true);

-- Subscribers: No public read (privacy)

-- ============================================
-- 5. CREATE RLS POLICIES - AUTHENTICATED WRITE
-- ============================================

-- Posts: Authenticated users full access
CREATE POLICY "Authenticated full access to posts"
  ON posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Categories: Authenticated users full access
CREATE POLICY "Authenticated full access to categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Testimonials: Authenticated users full access
CREATE POLICY "Authenticated full access to testimonials"
  ON testimonials FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Testimonials: Allow public to submit (INSERT only)
CREATE POLICY "Public can submit testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (true);

-- Subscribers: Allow public to subscribe
CREATE POLICY "Public can subscribe"
  ON subscribers FOR INSERT
  WITH CHECK (true);

-- Subscribers: Authenticated can manage
CREATE POLICY "Authenticated full access to subscribers"
  ON subscribers FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Site content: Authenticated users full access
CREATE POLICY "Authenticated full access to site_content"
  ON site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Faculty: Authenticated users full access
CREATE POLICY "Authenticated full access to faculty"
  ON faculty FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 6. CREATE STORAGE BUCKETS
-- ============================================

-- Note: You may need to create buckets via Dashboard if SQL doesn't work
-- Go to Storage → New Bucket

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('faculty', 'faculty', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']::text[]),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('forms', 'forms', true, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']::text[]),
  ('branding', 'branding', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/x-icon']::text[])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. CREATE STORAGE POLICIES
-- ============================================

-- Posts bucket
CREATE POLICY "Public read posts bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Authenticated upload to posts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update posts"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete from posts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- Faculty bucket
CREATE POLICY "Public read faculty bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'faculty');

CREATE POLICY "Authenticated upload to faculty"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'faculty' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update faculty"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'faculty' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete from faculty"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'faculty' AND auth.role() = 'authenticated');

-- Gallery bucket
CREATE POLICY "Public read gallery bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated upload to gallery"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update gallery"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete from gallery"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Avatars bucket (allow public upload for testimonials)
CREATE POLICY "Public read avatars bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

-- Forms bucket
CREATE POLICY "Public read forms bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forms');

CREATE POLICY "Authenticated upload to forms"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'forms' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update forms"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'forms' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete forms"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'forms' AND auth.role() = 'authenticated');

-- Branding bucket
CREATE POLICY "Public read branding bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding');

CREATE POLICY "Authenticated upload branding"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'branding' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update branding"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'branding' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete branding"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'branding' AND auth.role() = 'authenticated');

-- ============================================
-- 8. CREATE UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. INSERT SAMPLE DATA (Optional)
-- ============================================

-- Sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('News', 'news', 'School news and announcements'),
  ('Events', 'events', 'Upcoming and past events'),
  ('Blog', 'blog', 'Blog posts and articles')
ON CONFLICT (slug) DO NOTHING;

-- Seed the site_content singleton row so public reads always return data.
INSERT INTO site_content (id, vision, mission, history, contact_email, contact_phone, extra_content)
VALUES ('site-singleton', '', '', '', '', '', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('posts', 'categories', 'testimonials', 'subscribers', 'site_content', 'faculty');

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('posts', 'categories', 'testimonials', 'subscribers', 'site_content', 'faculty');

-- Verify storage buckets
SELECT id, name, public, file_size_limit FROM storage.buckets;
