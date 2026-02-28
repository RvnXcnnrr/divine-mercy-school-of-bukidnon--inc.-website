/**
 * postService.js
 * ──────────────────────────────────────────────────────────
 * Handles CRUD operations for posts (news, events, vlogs).
 *
 * Exports:
 *   fetchPosts(options)         – Paginated post list with filters
 *   fetchPost(idOrSlug)         – Single post by id or slug
 *   savePost(data)              – Create or update a post
 *   deletePost(id)              – Delete a post and its image
 *   toggleFeatured(id, value)   – Toggle is_featured flag
 * ──────────────────────────────────────────────────────────
 */
import slugify from 'slugify'
import { supabase, supabaseReady, supabaseTables } from '../lib/supabaseClient.js'
import { newsItems as fallbackNews } from '../data/siteContent.js'
import { deleteImageFromSupabase, extractPathFromUrl } from '../lib/supabaseStorage.js'

const slugOptions = { lower: true, strict: true, trim: true }
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function makeSlug(title, fallback = '') {
  const base = title?.trim() ? slugify(title, slugOptions) : fallback
  return base || `post-${Math.random().toString(36).slice(2, 8)}`
}

function createUuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

function isUuidLike(value) {
  return UUID_PATTERN.test(String(value || '').trim())
}

function normalizeValue(value) {
  return String(value || '').trim()
}

function humanizeSlug(value = '') {
  const normalized = normalizeValue(value)
    .replace(/[-_]+/g, ' ')
    .trim()
  if (!normalized) return ''

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function normalizeSlug(value = '') {
  const normalized = normalizeValue(value)
  if (!normalized || isUuidLike(normalized)) return ''
  return slugify(normalized, slugOptions)
}

function buildCategoryLookup(categories = []) {
  const byId = new Map()
  const bySlug = new Map()

  categories.forEach((category) => {
    const id = normalizeValue(category?.id)
    const slug = normalizeSlug(category?.slug || category?.name)
    const name = normalizeValue(category?.name)
    if (!name) return

    const normalized = { id, slug, name }
    if (id) byId.set(id, normalized)
    if (slug) bySlug.set(slug, normalized)
  })

  return { byId, bySlug }
}

async function readCategoryLookup() {
  if (!supabaseReady) return { byId: new Map(), bySlug: new Map() }

  try {
    const { data, error } = await supabase
      .from(supabaseTables.categories)
      .select('id, name, slug')
    if (error) throw error
    return buildCategoryLookup(data || [])
  } catch (error) {
    console.warn('[Post Service] category lookup failed; falling back to post fields.', error.message)
    return { byId: new Map(), bySlug: new Map() }
  }
}

function resolvePostCategory(post, categoryLookup) {
  const rawCategoryId = normalizeValue(post?.category_id)
  const rawCategorySlug = normalizeSlug(post?.category_slug)
  const rawCategoryLabel = normalizeValue(post?.category || post?.category_name)

  const fromId = rawCategoryId ? categoryLookup.byId.get(rawCategoryId) : null
  const fromSlug = rawCategorySlug ? categoryLookup.bySlug.get(rawCategorySlug) : null
  const fromCategoryText = normalizeSlug(rawCategoryLabel) ? categoryLookup.bySlug.get(normalizeSlug(rawCategoryLabel)) : null
  const resolved = fromId || fromSlug || fromCategoryText

  const fallbackLabel = !rawCategoryLabel || isUuidLike(rawCategoryLabel)
    ? ''
    : rawCategoryLabel
  const fallbackSlug = rawCategorySlug || normalizeSlug(fallbackLabel)

  const categoryName = resolved?.name || fallbackLabel || (fallbackSlug ? humanizeSlug(fallbackSlug) : 'Uncategorized')
  const categorySlug = resolved?.slug || fallbackSlug || ''
  const categoryId = resolved?.id || rawCategoryId || ''

  return {
    categoryName,
    categorySlug,
    categoryId,
  }
}

async function hydratePostsWithCategory(posts = []) {
  if (!posts.length) return posts
  const categoryLookup = await readCategoryLookup()

  return posts.map((post) => {
    const { categoryName, categorySlug, categoryId } = resolvePostCategory(post, categoryLookup)
    return {
      ...post,
      category: categoryName,
      category_name: categoryName,
      category_slug: categorySlug || post.category_slug || '',
      category_id: categoryId || post.category_id || '',
    }
  })
}

function matchesCategory(post, categoryFilter) {
  const target = normalizeSlug(categoryFilter)
  if (!target) return true

  const candidates = [
    normalizeSlug(post?.category_slug),
    normalizeSlug(post?.category_name || post?.category),
    normalizeSlug(post?.category_id),
  ].filter(Boolean)

  return candidates.some((candidate) => candidate === target || candidate.includes(target))
}

function isMissingIdempotencySupport(error) {
  const message = String(error?.message || '').toLowerCase()
  if (!message) return false
  return (
    (message.includes('idempotency_key') && message.includes('does not exist')) ||
    (message.includes('on conflict') && message.includes('idempotency_key') && message.includes('constraint')) ||
    message.includes('no unique or exclusion constraint matching the on conflict specification')
  )
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

  const shouldFilterCategoryInMemory = Boolean(categorySlug) && !isUuidLike(categorySlug)

  if (status) query = query.eq('status', status)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (categorySlug && !shouldFilterCategoryInMemory) query = query.eq('category_id', categorySlug)
  if (hasVideo) query = query.not('video_url', 'is', null)
  if (isFeatured != null) query = query.eq('is_featured', isFeatured)
  if (search) query = query.ilike('title', `%${search}%`)

  if (limit && !shouldFilterCategoryInMemory) {
    const start = (page - 1) * limit
    const end = start + limit - 1
    query = query.range(start, end)
  }

  const { data, error, count } = await query
  if (error) throw error

  const hydrated = await hydratePostsWithCategory(data || [])
  const categoryMatched = categorySlug
    ? hydrated.filter((item) => matchesCategory(item, categorySlug))
    : hydrated

  if (limit && shouldFilterCategoryInMemory) {
    const start = (page - 1) * limit
    const end = start + limit
    return {
      data: categoryMatched.slice(start, end),
      count: categoryMatched.length,
    }
  }

  return { data: categoryMatched, count: count ?? categoryMatched.length }
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
  const isUpdate = Boolean(payload?.id)
  const shouldGenerateSlug = Boolean(payload?.title) || !isUpdate
  const slug = shouldGenerateSlug ? (payload.slug || makeSlug(payload.title, payload.slug)) : payload.slug
  const record = {
    ...payload,
    updated_at: new Date().toISOString(),
  }
  if (slug) record.slug = slug

  if (!record.category_id && record.category_slug) {
    record.category_id = record.category_slug
  }

  if (!isUpdate && !record.status) record.status = 'draft'
  if (!isUpdate && !record.created_at) record.created_at = new Date().toISOString()
  if (!isUpdate && !record.idempotency_key) {
    record.idempotency_key = createUuidV4()
  }

  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping savePost; returning payload only.')
    return { data: record }
  }

  if (isUpdate) {
    const { id, ...updates } = record
    const { data, error } = await supabase
      .from(supabaseTables.posts)
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) throw error
    return { data }
  }

  const runUpsert = (upsertRecord, options) =>
    supabase
      .from(supabaseTables.posts)
      .upsert(upsertRecord, options)
      .select('*')
      .maybeSingle()

  const { data, error } = await runUpsert(record, { onConflict: 'idempotency_key' })
  if (!error) return { data }

  // Graceful fallback until DB migration is applied.
  if (isMissingIdempotencySupport(error)) {
    console.warn('[Post Service] idempotency_key support missing in DB; falling back to legacy upsert.')
    const fallbackRecord = { ...record }
    delete fallbackRecord.idempotency_key
    const { data: fallbackData, error: fallbackError } = await runUpsert(fallbackRecord)
    if (fallbackError) throw fallbackError
    return { data: fallbackData }
  }

  throw error
}

export async function deletePost(id) {
  if (!supabaseReady) {
    console.warn('[Supabase] Not configured. Skipping deletePost.')
    return { data: null }
  }

  // Fetch the post to get the featured_image_url
  const { data: post } = await supabase
    .from(supabaseTables.posts)
    .select('featured_image_url')
    .eq('id', id)
    .maybeSingle()

  // Delete the associated image from Supabase Storage if it exists
  if (post?.featured_image_url && post.featured_image_url.includes('supabase.co/storage')) {
    try {
      const imagePath = extractPathFromUrl(post.featured_image_url)
      if (imagePath) {
        // Determine bucket from URL
        const bucketMatch = post.featured_image_url.match(/\/object\/public\/([^/]+)\//)
        const bucket = bucketMatch ? bucketMatch[1] : 'posts'
        await deleteImageFromSupabase(imagePath, bucket)
        console.log(`[Post Service] Deleted associated image: ${imagePath}`)
      }
    } catch (error) {
      console.error('[Post Service] Failed to delete image:', error)
      // Continue with post deletion even if image deletion fails
    }
  }

  // Delete the post from database
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
