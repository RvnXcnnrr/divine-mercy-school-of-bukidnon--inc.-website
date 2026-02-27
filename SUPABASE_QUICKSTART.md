# Quick Start: Supabase Setup

**5-minute guide to get your Supabase backend running**

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: `dmsb-website` (or your choice)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to your users
4. Click **Create new project** (takes ~2 minutes)

## Step 2: Get Your Credentials

1. Once project is ready, go to **Settings** → **API**
2. Copy these values:
   - **URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Update Environment Variables

Edit `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Save the file.

## Step 4: Run Database Setup

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase-setup.sql` from your project root
4. Copy ALL content and paste into SQL Editor
5. Click **Run** (bottom right)

✅ You should see: `Success. No rows returned`

## Step 5: Verify Setup

### Check Tables
1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ posts
   - ✅ categories
   - ✅ testimonials
   - ✅ subscribers
   - ✅ site_content
   - ✅ faculty

### Check Storage
1. Go to **Storage** (left sidebar)
2. You should see these buckets:
   - ✅ posts
   - ✅ faculty
   - ✅ gallery
   - ✅ avatars

If buckets aren't created, create them manually:
- Click **New bucket**
- Name: `posts`, Public: ✅, File size limit: `10MB`
- Repeat for `faculty` (5MB), `gallery` (10MB), `avatars` (2MB)

## Step 6: Test Connection

1. Start your dev server: `npm run dev`
2. Open browser console (F12)
3. Type:
```javascript
// Test database
fetch('https://your-project.supabase.co/rest/v1/posts?select=*', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
}).then(r => r.json()).then(console.log)
```

✅ Should return `[]` (empty array) or your posts

## Step 7: (Optional) Create Admin User

For protected admin routes:

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email + password
4. Click **Create user**
5. Use these credentials to log in to `/admin/login`

## Step 8: Start Building!

Your backend is ready! 

### Using Supabase Storage
```javascript
import { uploadImageToSupabase } from '@/lib/supabaseStorage'
const result = await uploadImageToSupabase(file, { bucket: 'posts' })
console.log(result.publicUrl)
```

---

## Troubleshooting

### "Invalid API credentials"
- ✅ Check `.env` values match Supabase Dashboard
- ✅ Restart dev server after changing `.env`

### "row-level security policy" error
- ✅ Run the SQL setup script again
- ✅ Verify RLS policies exist in **Authentication** → **Policies**

### Storage uploads fail
- ✅ Check bucket exists and is public
- ✅ Verify storage policies in **Storage** → **Policies**
- ✅ Check file size under bucket limit

### Tables don't appear
- ✅ Re-run `supabase-setup.sql` in SQL Editor
- ✅ Check for error messages in SQL output
- ✅ Try creating tables manually via Table Editor

---

## What's Next?

- 📖 Full guide: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
- 🖼️ Image uploads: [docs/IMAGE_UPLOAD.md](docs/IMAGE_UPLOAD.md)
- 🚀 Deploy: Configure production environment variables

## Production Deployment

When deploying to production:

1. ✅ Use production Supabase project (separate from dev)
2. ✅ Set environment variables in hosting platform (Vercel, Netlify, etc.)
3. ✅ Enable database backups in Supabase Dashboard
4. ✅ Set up custom domain if needed
5. ✅ Configure CORS in Supabase if needed

---

**Need help?** Check [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for detailed documentation.
