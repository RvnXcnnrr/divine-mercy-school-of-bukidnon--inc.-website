/**
 * supabaseClient.js
 * ──────────────────────────────────────────────────────────
 * Initialises and exports the Supabase client.
 * Reads credentials from .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * supabaseReady — false when env vars are missing (dev fallback mode).
 * supabaseTables — single source of truth for all table names.
 * ──────────────────────────────────────────────────────────
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Public data will fall back to static content until set.')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const supabaseTables = {
  posts: 'posts',
  categories: 'categories',
  subscribers: 'subscribers',
  siteContent: 'site_content',
  faculty: 'faculty',
  testimonials: 'testimonials',
}
