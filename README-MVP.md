# MVP Guide

A quick path to get the School Vlog & Updates Platform running in staging.

## 1) Configure env
Copy `.env.example` to `.env` and set:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_SITE_URL` (e.g., https://staging.yoursite.com)

## 2) Supabase tables
Create tables (simplified):
- `categories` (id text or uuid primary key, name text, slug text)
- `posts` (id uuid pk default gen_random_uuid(), title text, slug text unique, excerpt text, content text, featured_image_url text, video_url text, category_id text references categories(id), is_featured boolean default false, status text default 'draft', created_at timestamptz default now(), updated_at timestamptz default now())
- `subscribers` (id uuid pk default gen_random_uuid(), email text unique, created_at timestamptz default now())
- Optional `profiles` with `id uuid primary key` referencing `auth.users`, `role text` default 'editor'.

RLS quick start:
- `categories`: enable RLS, policy `public_read` (select: true for all)
- `posts`: enable RLS, policy `public_read_published` (select where status = 'published'), policy `edit_authenticated` (insert/update/delete for authenticated)
- `subscribers`: enable RLS, policy `insert_public` (insert for all), policy `read_owner` if you need reads

## 3) Cloudinary
- Create unsigned upload preset (or signed workflow)
- Note `cloud name` and `upload preset`

## 4) Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173.

## 5) Admin login
- Use the **Admin** button in the navbar (floating modal) to sign in with Supabase email/password.
- Dashboard lives at `/admin`; if you prefer a dedicated page, `/admin/login` still exists.

## 6) Deploy
- Set the same env vars in your host (Netlify/Vercel/etc.)
- `npm run build` then deploy `dist`

## 7) Content workflow
- Create categories first
- Create posts: set status `published` to show publicly; toggle `is_featured` to pin a vlog on home hero
- Upload images through the editor (Cloudinary) or paste URLs

## 8) Nice-to-haves
- Add signed upload via Supabase Edge Function for stricter security
- Add dynamic OG tags + sitemap/robots for SEO
- Add PWA toggle once ready
