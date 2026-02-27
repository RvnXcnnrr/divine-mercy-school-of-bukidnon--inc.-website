/**
 * siteInfoService.js
 * ──────────────────────────────────────────────────────────
 * Manages the school's site-wide content stored in Supabase
 * (vision, mission, contact info, extra page content).
 * Falls back to siteContent.js defaults when Supabase is not configured.
 *
 * Exports:
 *   fetchSiteContent()              – Load all site content fields
 *   saveSiteContent(data)           – Upsert site content
 *   fetchFaculty()                  – List all faculty members
 *   saveFaculty(data)               – Create or update a faculty record
 *   deleteFaculty(id)               – Delete a faculty member
 * ──────────────────────────────────────────────────────────
 */
import { supabase, supabaseReady, supabaseTables } from '../lib/supabaseClient.js'
import {
  missionVision as fallbackMissionVision,
  facultyMembers as fallbackFaculty,
  contactInfo as fallbackContact,
  extraContent as fallbackExtraContent,
} from '../data/siteContent.js'

const SINGLETON_ID = 'site-singleton'
export const FACULTY_CACHE_KEY = 'dmsb-faculty-cache'

export function readFacultyCache() {
  try {
    const raw = localStorage.getItem(FACULTY_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('[faculty cache] read failed', err)
    return null
  }
}

export function cacheFaculty(list) {
  try {
    localStorage.setItem(FACULTY_CACHE_KEY, JSON.stringify(list || []))
  } catch (err) {
    console.warn('[faculty cache] write failed', err)
  }
}

function withExtraContent(row = {}) {
  return {
    ...row,
    extra_content: { ...fallbackExtraContent, ...(row.extra_content || {}) },
  }
}

export async function fetchSiteContent() {
  if (!supabaseReady) {
    return { data: { id: SINGLETON_ID, ...fallbackMissionVision, ...fallbackContact, extra_content: fallbackExtraContent } }
  }

  // First try to load the canonical singleton row.
  const { data: singleton, error } = await supabase
    .from(supabaseTables.siteContent)
    .select('*')
    .eq('id', SINGLETON_ID)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error

  if (singleton) return { data: withExtraContent(singleton) }

  // If there is already a row but with a different id (older saves), fetch the latest one instead of falling back.
  const { data: latest, error: latestError } = await supabase
    .from(supabaseTables.siteContent)
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError && latestError.code !== 'PGRST116') throw latestError

  const fallback = { id: SINGLETON_ID, ...fallbackMissionVision, ...fallbackContact, extra_content: fallbackExtraContent }
  return { data: latest ? withExtraContent(latest) : fallback }
}

export async function saveSiteContent(payload) {
  if (!supabaseReady) throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  const mergedExtra = { ...fallbackExtraContent, ...(payload.extra_content || {}) }
  const record = {
    id: payload.id || SINGLETON_ID,
    vision: payload.vision?.trim() || '',
    mission: payload.mission?.trim() || '',
    history: payload.history?.trim() || '',
    contact_email: payload.contact_email?.trim() || '',
    contact_phone: payload.contact_phone?.trim() || '',
    extra_content: mergedExtra,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(supabaseTables.siteContent)
    .upsert(record, { onConflict: 'id' })
    .select('*')
    .maybeSingle()

  if (error) throw error
  return { data }
}

export async function fetchFaculty() {
  if (!supabaseReady) {
    return { data: fallbackFaculty }
  }

  const { data, error } = await supabase
    .from(supabaseTables.faculty)
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return { data: data ?? [] }
}

export async function upsertFaculty(member) {
  if (!supabaseReady) throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  const record = {
    ...member,
    name: member.name?.trim() || 'Untitled',
    role: member.role?.trim() || '',
    photo: member.photo?.trim() || '',
    sort_order: member.sort_order ?? null,
    updated_at: new Date().toISOString(),
  }

  // Allow Supabase to generate a primary key when creating a new member.
  if (!record.id) delete record.id

  const { data, error } = await supabase
    .from(supabaseTables.faculty)
    .upsert(record)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return { data }
}

export async function deleteFaculty(id) {
  if (!supabaseReady) throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  const { error } = await supabase.from(supabaseTables.faculty).delete().eq('id', id)
  if (error) throw error
  return { data: true }
}
