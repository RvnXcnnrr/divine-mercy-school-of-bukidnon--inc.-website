import slugify from 'slugify'
import { supabase, supabaseReady, supabaseTables } from '../lib/supabaseClient.js'
import { newsItems as fallbackNews } from '../data/siteContent.js'

const slugOptions = { lower: true, strict: true, trim: true }

function makeSlug(title, fallback = '') {
  const base = title?.trim() ? slugify(title, slugOptions) : fallback
  return base || `post-${Math.random().toString(36).slice(2, 8)}`
}

export async function fetchPosts({ status = 'published', categoryId, categorySlug, search, limit = 12, page = 1, hasVideo, isFeatured } = {}) {
  if (!supabaseReady) {
    const filtered = fallbackNews
      .filter((n) => (status ? (n.status || 'published') === status : true))
      .filter((n) => (hasVideo ? Boolean(n.video_url) : true))
      .map((n, idx) => ({ ...n, id: n.id ?? idx + 1 }))
    return { data: filtered.slice(0, limit), count: filtered.length }
  }

  let query = supabase
    .from(supabaseTables.posts)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (categorySlug) query = query.eq('category_id', categorySlug)
  if (hasVideo) query = query.not('video_url', 'is', null)
  if (isFeatured != null) query = query.eq('is_featured', isFeatured)
  if (search) query = query.ilike('title', `%${search}%`)

  if (limit) {
    const start = (page - 1) * limit
    const end = start + limit - 1
    query = query.range(start, end)
  }

  const { data, error, count } = await query
  if (error) throw error

  const filtered = categorySlug
    ? (data || []).filter((item) => {
        const tag = (item.category || item.category_id || '').toString().toLowerCase()
        return tag.includes(String(categorySlug).toLowerCase())
      })
    : data

  return { data: filtered ?? [], count: count ?? filtered?.length ?? 0 }
}

export async function fetchPostById(idOrSlug) {
  if (!supabaseReady) {
    const match = fallbackNews.find((n) => String(n.id) === String(idOrSlug) || n.slug === idOrSlug)
    return { data: match ?? null }
  }
  const isUuid = typeof idOrSlug === 'string' && idOrSlug.includes('-')
  const column = isUuid ? 'id' : 'slug'
  const { data, error } = await supabase
    .from(supabaseTables.posts)
    .select('*')
    .eq(column, idOrSlug)
    .maybeSingle()
  if (error) throw error
  return { data }
}

export async function savePost(payload) {
  const slug = payload.slug || makeSlug(payload.title, payload.slug)
  const record = {
    ...payload,
    slug,
    updated_at: new Date().toISOString(),
  }

  if (!record.category_id && record.category_slug) {
    record.category_id = record.category_slug
  }

  if (!record.status) record.status = 'draft'
  if (!record.created_at) record.created_at = new Date().toISOString()

  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping savePost; returning payload only.')
    return { data: record }
  }

  const { data, error } = await supabase
    .from(supabaseTables.posts)
    .upsert(record)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return { data }
}

export async function deletePost(id) {
  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping deletePost.')
    return { data: null }
  }
  const { error } = await supabase.from(supabaseTables.posts).delete().eq('id', id)
  if (error) throw error
  return { data: true }
}

export async function toggleFeatured(id, isFeatured) {
  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping toggleFeatured.')
    return { data: null }
  }
  const { data, error } = await supabase
    .from(supabaseTables.posts)
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return { data }
}
