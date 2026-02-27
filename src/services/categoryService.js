/**
 * categoryService.js
 * ──────────────────────────────────────────────────────────
 * Handles CRUD operations for post categories.
 *
 * Exports:
 *   fetchCategories()           – List all categories
 *   createCategory(name)        – Create a new category (auto-slugified)
 *   updateCategory(id, name)    – Rename a category
 *   deleteCategory(id)          – Delete a category by id
 * ──────────────────────────────────────────────────────────
 */
import slugify from 'slugify'
import { supabase, supabaseReady, supabaseTables } from '../lib/supabaseClient.js'

const slugOptions = { lower: true, strict: true, trim: true }

export async function fetchCategories() {
  if (!supabaseReady) {
    return {
      data: [
        { id: 'events', name: 'Events', slug: 'events' },
        { id: 'sports', name: 'Sports', slug: 'sports' },
        { id: 'academic', name: 'Academic', slug: 'academic' },
        { id: 'campus-life', name: 'Campus Life', slug: 'campus-life' },
      ],
    }
  }

  const { data, error } = await supabase
    .from(supabaseTables.categories)
    .select('*')
    .order('name')
  if (error) throw error
  return { data }
}

export async function saveCategory(payload) {
  const record = { ...payload }
  record.slug = payload.slug || slugify(payload.name || '', slugOptions)
  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping saveCategory; returning payload only.')
    return { data: record }
  }
  const { data, error } = await supabase
    .from(supabaseTables.categories)
    .upsert(record)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return { data }
}

export async function deleteCategory(id) {
  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping deleteCategory.')
    return { data: null }
  }
  const { error } = await supabase.from(supabaseTables.categories).delete().eq('id', id)
  if (error) throw error
  return { data: true }
}
