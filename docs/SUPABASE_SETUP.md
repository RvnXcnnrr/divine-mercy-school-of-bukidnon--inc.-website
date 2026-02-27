# Supabase Setup Guide

Complete guide for setting up Supabase as your backend (database + file storage).

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Database Schema](#database-schema)
3. [Storage Setup](#storage-setup)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Using Supabase Storage for Images](#using-supabase-storage-for-images)

---

## Environment Variables

### Required Variables
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SITE_URL=http://localhost:5173
```

### Getting Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Database Schema

### Required Tables

#### 1. **posts** table
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  gallery_images TEXT[],  -- or use 'images' column
  video_url TEXT,
  category_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_featured ON posts(is_featured);
```

#### 2. **categories** table
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. **testimonials** table
```sql
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
```

#### 4. **subscribers** table
```sql
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. **site_content** table
```sql
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 6. **faculty** table
```sql
CREATE TABLE faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Apply All Schemas at Once
Go to **Supabase Dashboard** → **SQL Editor** → paste and run the complete schema.

---

## Storage Setup

### Create Storage Buckets

#### Via Supabase Dashboard:
1. Go to **Storage** in sidebar
2. Click **New bucket**
3. Create these buckets:

| Bucket Name | Public? | File Size Limit | Allowed MIME Types |
|-------------|---------|-----------------|-------------------|
| `posts` | ✅ Yes | 10 MB | `image/*` |
| `faculty` | ✅ Yes | 5 MB | `image/*` |
| `gallery` | ✅ Yes | 10 MB | `image/*,video/*` |
| `avatars` | ✅ Yes | 2 MB | `image/*` |

#### Via SQL:
```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('faculty', 'faculty', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);
```

### Storage Policies (Public Upload + Read)

```sql
-- Posts bucket policies
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- Repeat for other buckets (faculty, gallery, avatars)
-- Just replace 'posts' with bucket name
```

### Allow Anonymous Uploads (Optional - Less Secure)
If you want anonymous users to upload (e.g., testimonial avatars):

```sql
CREATE POLICY "Anyone can upload to avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');
```

---

## Row Level Security (RLS)

### Enable RLS on All Tables
```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
```

### Public Read Policies
```sql
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
```

### Admin Write Policies
```sql
-- Admins can do everything (assumes you set up auth)
CREATE POLICY "Authenticated users full access to posts"
  ON posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Repeat for other tables...
```

---

## Using Supabase Storage for Images

The project uses `src/lib/supabaseStorage.js` for all image uploads with automatic compression.

### Upload an Image

```javascript
import { uploadImageToSupabase } from '../../lib/supabaseStorage.js'

const result = await uploadImageToSupabase(file, { 
  bucket: 'posts',
  folder: 'news',
  maxSizeMB: 2,
  maxWidthOrHeight: 1920
})

console.log(result.publicUrl) // https://project.supabase.co/storage/v1/object/public/posts/...
```

### Available Functions

- `uploadImageToSupabase(file, options)` - Upload with auto-compression
- `deleteImageFromSupabase(path, bucket)` - Delete a file
- `uploadMultipleImages(files, options)` - Upload multiple files in parallel
- `getSignedUrl(path, bucket, expiresIn)` - Get signed URL for private files
- `listFiles(bucket, folder, options)` - List files in a bucket

---

## Testing Your Setup

### 1. Test Database Connection
Open browser console on your site and run:
```javascript
// Check connection (note: import.meta only works in module context)
fetch(yourSupabaseURL + '/rest/v1/posts?select=*&limit=1', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
}).then(r => r.json()).then(console.log)
```

### 2. Test Storage Upload
Go to Admin → Posts → New Post → Upload an image and check browser console for:
```
[Image Compression] Compressed from 3.44MB to 1.65MB
[Supabase Storage] Upload successful: https://...
```

### 3. Check Bucket Permissions
Go to **Storage** → **Policies** → verify policies are active.

---

## Troubleshooting

### Images Not Uploading
1. ✅ Check bucket exists and is public
2. ✅ Verify storage policies allow INSERT
3. ✅ Check file size under bucket limits
4. ✅ Verify MIME type is allowed
5. ✅ Check browser console for errors

### Images Upload but Can't Access
1. ✅ Ensure bucket is marked **public**
2. ✅ Verify `getPublicUrl()` is called correctly
3. ✅ Check RLS policies on storage.objects

### Database Queries Fail
1. ✅ Verify RLS policies exist for public reads
2. ✅ Check anon key is correct in `.env`
3. ✅ Ensure tables exist with correct names

---

## Production Checklist

- [ ] All tables created with proper columns
- [ ] RLS enabled on all tables
- [ ] Public read policies configured
- [ ] Admin write policies configured (if using auth)
- [ ] Storage buckets created
- [ ] Storage policies configured
- [ ] File size limits set appropriately
- [ ] MIME types restricted properly
- [ ] Environment variables set in production
- [ ] Test uploads work in production

---

## Next Steps

1. **Authentication**: Set up Supabase Auth for admin users
2. **Realtime**: Enable realtime subscriptions for live updates
3. **Edge Functions**: Create serverless functions for complex operations
4. **Backups**: Configure automated database backups

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)
