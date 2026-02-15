# DMSB School Vlog & Updates Platform

Modern React + Vite site for Divine Mercy School of Bukidnon with Supabase (auth/database) and Cloudinary (media CDN). Includes public vlogs/news/events/gallery and a protected admin dashboard with modal login.

## Stack
- React 19 + Vite 7
- Supabase auth + Postgres (posts, categories, subscribers)
- Cloudinary for image uploads/CDN
- React Query for data fetching; React Hook Form + Zod for admin forms
- Tailwind (per existing styles)

## Getting started
1) Install: `npm install`
2) Copy env: `cp .env.example .env` (then fill values)
3) Run dev server: `npm run dev` (default http://localhost:5173)

## Environment variables
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET` (unsigned or signed)
- `VITE_SITE_URL` (for SEO/meta)
- `VITE_ENABLE_PWA` (optional)

## Supabase schema (minimum)
- `posts`: id (uuid), title, slug, content, excerpt, featured_image_url, video_url, category_id, is_featured (bool), status (`draft|published`), created_at, updated_at
- `categories`: id (text/uuid), name, slug
- `subscribers`: id, email, created_at
- Optional `profiles` with `role` (`admin|editor`) used by the app for role checks.

RLS: allow public read on published posts/categories; allow authenticated insert/update/delete per role. Store service keys server-side only.

## Media uploads
- Cloudinary unsigned preset works out of the box; for signed uploads, add a Supabase Edge Function to return signatures and swap the uploader to use it.

## Admin access
- Click the **Admin** button in the navbar to open the floating login modal (Supabase email/password). On success you land on `/admin` for dashboard/posts/settings.

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – lint

## SEO/perf (next items)
- Dynamic meta/OG tags per page/post, sitemap.xml, robots.txt
- Image lazy loading (already enabled for cards) and Cloudinary `f_auto,q_auto`
- Optional PWA/service worker when `VITE_ENABLE_PWA=true`
