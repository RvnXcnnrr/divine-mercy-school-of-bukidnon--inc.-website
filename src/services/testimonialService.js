/**
 * testimonialService.js
 * ──────────────────────────────────────────────────────────
 * Manages student/parent testimonials submitted via the public form.
 *
 * Exports:
 *   fetchApprovedTestimonials()         – Public: approved testimonials only
 *   fetchTestimonials({ status })       – Admin: all testimonials with filter
 *   submitTestimonial(data)             – Public: submit a new testimonial
 *   updateTestimonialStatus(id, status) – Admin: approve / reject
 *   deleteTestimonial(id)               – Admin: permanently remove
 * ──────────────────────────────────────────────────────────
 */
import { supabase, supabaseReady, supabaseTables } from '../lib/supabaseClient.js'
import { testimonials as fallbackTestimonials } from '../data/siteContent.js'

export async function fetchApprovedTestimonials({ limit = 24 } = {}) {
  if (!supabaseReady) {
    console.warn('[Testimonials] Supabase not configured; returning fallback testimonials.')
    return { data: fallbackTestimonials }
  }

  const { data, error } = await supabase
    .from(supabaseTables.testimonials)
    .select('id, name, role, quote, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[Testimonials] Failed to fetch testimonials', error)
    return { data: fallbackTestimonials, error }
  }

  return { data }
}

export async function submitTestimonial(payload) {
  if (!payload?.name || !payload?.quote) throw new Error('Name and testimonial are required.')

  if (!supabaseReady) {
    console.warn('[Testimonials] Supabase not configured; simulating submission.')
    return { data: { ...payload, status: 'pending', id: 'local' } }
  }

  // Use minimal returning to avoid select RLS conflicts on pending rows
  const { error } = await supabase
    .from(supabaseTables.testimonials)
    .insert([{ ...payload, status: 'pending' }], { returning: 'minimal' })

  if (error) throw error
  return { data: { status: 'pending' } }
}

export async function fetchTestimonials({ status, limit = 100 } = {}) {
  if (!supabaseReady) {
    console.warn('[Testimonials] Supabase not configured; no testimonials loaded.')
    return { data: [] }
  }

  let query = supabase
    .from(supabaseTables.testimonials)
    .select('id, name, role, quote, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Testimonials] Failed to fetch testimonials', error)
    return { data: [], error }
  }

  return { data }
}

export async function updateTestimonialStatus(id, status) {
  if (!id || !status) throw new Error('ID and status are required.')

  if (!supabaseReady) {
    console.warn('[Testimonials] Supabase not configured; simulating status update.')
    return { data: { id, status } }
  }

  const { error } = await supabase
    .from(supabaseTables.testimonials)
    .update({ status }, { returning: 'minimal' })
    .eq('id', id)

  if (error) throw error
  return { data: { id, status } }
}

export async function deleteTestimonial(id) {
  if (!id) throw new Error('ID is required.')

  if (!supabaseReady) {
    console.warn('[Testimonials] Supabase not configured; simulating delete.')
    return { data: { id } }
  }

  const { error } = await supabase
    .from(supabaseTables.testimonials)
    .delete({ returning: 'minimal' })
    .eq('id', id)

  if (error) throw error
  return { data: { id } }
}
