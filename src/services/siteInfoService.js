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
const FACULTY_EXTRA_KEY = 'faculty_members'

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

function sortFacultyList(list = []) {
  return [...list].sort((a, b) => {
    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

function makeLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `faculty-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeFacultyMember(member = {}) {
  return {
    id: member.id || makeLocalId(),
    name: member.name?.trim() || 'Untitled',
    role: member.role?.trim() || '',
    photo: member.photo?.trim() || '',
    sort_order: Number.isFinite(member.sort_order) ? member.sort_order : member.sort_order ?? null,
    created_at: member.created_at || null,
    updated_at: member.updated_at || null,
  }
}

function normalizeFacultyList(list = []) {
  const seen = new Set()
  const normalized = []
  for (const raw of list || []) {
    const member = normalizeFacultyMember(raw)
    if (!member.name) continue
    if (seen.has(member.id)) continue
    seen.add(member.id)
    normalized.push(member)
  }
  return sortFacultyList(normalized)
}

async function fetchFacultyFromSiteContent() {
  const { data } = await fetchSiteContent()
  const list = data?.extra_content?.[FACULTY_EXTRA_KEY] || []
  return normalizeFacultyList(list)
}

async function saveFacultyToSiteContent(mutator) {
  const { data } = await fetchSiteContent()
  const safe = data || { id: SINGLETON_ID, ...fallbackMissionVision, ...fallbackContact, extra_content: fallbackExtraContent }
  const extra = { ...fallbackExtraContent, ...(safe.extra_content || {}) }
  const current = normalizeFacultyList(extra[FACULTY_EXTRA_KEY] || [])
  const next = normalizeFacultyList(mutator(current))
  const payload = {
    ...safe,
    extra_content: {
      ...extra,
      [FACULTY_EXTRA_KEY]: next,
    },
  }
  await saveSiteContent(payload)
  return next
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
    return { data: normalizeFacultyList(fallbackFaculty) }
  }

  try {
    const { data, error } = await supabase
      .from(supabaseTables.faculty)
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    const normalized = normalizeFacultyList(data || [])
    if (normalized.length) return { data: normalized }

    const mirrored = await fetchFacultyFromSiteContent()
    if (mirrored.length) return { data: mirrored }

    return { data: [] }
  } catch (error) {
    console.warn('[Faculty] falling back to site_content mirror', error)
    const mirrored = await fetchFacultyFromSiteContent()
    if (mirrored.length) return { data: mirrored }
    return { data: normalizeFacultyList(fallbackFaculty) }
  }
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

  try {
    const { data, error } = await supabase
      .from(supabaseTables.faculty)
      .upsert(record, { onConflict: 'id' })
      .select('*')
      .maybeSingle()

    if (error) throw error
    const saved = normalizeFacultyMember(data || record)

    try {
      await saveFacultyToSiteContent((current) => {
        const next = [...current.filter((item) => item.id !== saved.id), saved]
        return next
      })
    } catch (mirrorError) {
      console.warn('[Faculty] failed to sync site_content mirror after table upsert', mirrorError)
    }

    return { data: saved }
  } catch (tableError) {
    console.warn('[Faculty] table upsert failed; using site_content mirror', tableError)
    const localRecord = normalizeFacultyMember({ ...record, id: record.id || makeLocalId() })
    const mirrored = await saveFacultyToSiteContent((current) => {
      const next = [...current.filter((item) => item.id !== localRecord.id), localRecord]
      return next
    })
    return { data: mirrored.find((item) => item.id === localRecord.id) || localRecord }
  }
}

export async function deleteFaculty(id) {
  if (!supabaseReady) throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')

  try {
    const { error } = await supabase.from(supabaseTables.faculty).delete().eq('id', id)
    if (error) throw error
  } catch (tableError) {
    console.warn('[Faculty] table delete failed; using site_content mirror', tableError)
  }

  try {
    await saveFacultyToSiteContent((current) => current.filter((item) => item.id !== id))
  } catch (mirrorError) {
    console.warn('[Faculty] failed to sync delete to site_content mirror', mirrorError)
  }

  return { data: true }
}
