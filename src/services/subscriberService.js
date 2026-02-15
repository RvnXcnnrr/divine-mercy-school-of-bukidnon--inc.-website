import { supabase, supabaseReady } from '../lib/supabaseClient.js'

export async function subscribeEmail(email) {
  if (!email) throw new Error('Email is required')
  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping subscribeEmail; returning mock success.')
    return { data: { email } }
  }
  const { data, error } = await supabase
    .from('subscribers')
    .insert({ email })
    .select('*')
    .maybeSingle()
  if (error) throw error
  return { data }
}
