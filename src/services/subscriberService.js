/**
 * subscriberService.js
 * ──────────────────────────────────────────────────────────
 * Manages newsletter / email subscribers.
 *
 * Exports:
 *   subscribeEmail(email)       – Add a new subscriber
 *   fetchSubscribers()          – List all subscribers (admin use)
 *   deleteSubscriber(id)        – Remove a subscriber by id
 * ──────────────────────────────────────────────────────────
 */
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

export async function fetchSubscribers() {
  if (!supabaseReady) return { data: [] }
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return { data: data || [] }
}

export async function deleteSubscriber(id) {
  if (!supabaseReady) return
  const { error } = await supabase.from('subscribers').delete().eq('id', id)
  if (error) throw error
}
