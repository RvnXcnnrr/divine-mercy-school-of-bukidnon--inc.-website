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
}
