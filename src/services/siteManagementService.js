import { createId, createSiteManagementDefaults } from '../data/siteManagementDefaults.js'
import { fetchSiteContent, saveSiteContent } from './siteInfoService.js'

const DRAFT_KEY = 'site_management_draft'
const PUBLISHED_KEY = 'site_management_published'
const HISTORY_KEY = 'site_management_history'
const META_KEY = 'site_management_meta'
const HISTORY_LIMIT = 20

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge(base, incoming) {
  if (Array.isArray(base)) {
    return Array.isArray(incoming) ? incoming.map((item) => deepMerge({}, item)) : base
  }

  if (!isObject(base)) {
    return incoming === undefined ? base : incoming
  }

  const next = { ...base }
  if (!isObject(incoming)) return next

  for (const key of Object.keys(incoming)) {
    const baseValue = base[key]
    const incomingValue = incoming[key]

    if (Array.isArray(baseValue)) {
      next[key] = Array.isArray(incomingValue) ? incomingValue.map((item) => deepMerge({}, item)) : baseValue
      continue
    }

    if (isObject(baseValue) && isObject(incomingValue)) {
      next[key] = deepMerge(baseValue, incomingValue)
      continue
    }

    next[key] = incomingValue
  }

  return next
}

function withIds(list, prefix, fallbackFactory) {
  const source = Array.isArray(list) && list.length ? list : fallbackFactory ? fallbackFactory() : []
  return source.map((item, index) => ({
    ...item,
    id: item?.id || `${prefix}-${index + 1}`,
  }))
}

function historyToTimeline(historyText) {
  const chunks = String(historyText || '')
    .split(/(?<=[.!?])\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!chunks.length) return []
  return chunks.slice(0, 6).map((description, index) => ({
    id: `about-timeline-${index + 1}`,
    year: '',
    description,
    isVisible: true,
  }))
}

function legacyToSiteManagement(content) {
  const defaults = createSiteManagementDefaults()
  const extra = content?.extra_content || {}

  const mapped = clone(defaults)
  mapped.aboutPage.intro = extra.about_intro || mapped.aboutPage.intro
  mapped.aboutPage.principalMessage = extra.principal_message || mapped.aboutPage.principalMessage
  mapped.aboutPage.coreValues = withIds(
    (extra.core_values || []).map((value) => ({ value, isVisible: true })),
    'core-value',
    () => mapped.aboutPage.coreValues
  )

  if (content?.mission) mapped.aboutPage.mission = content.mission
  if (content?.vision) mapped.aboutPage.vision = content.vision
  const timeline = historyToTimeline(content?.history)
  if (timeline.length) mapped.aboutPage.timeline = timeline

  mapped.academicsPage.programTabs = withIds(
    (extra.programs || []).map((program, idx) => ({
      key: idx % 2 === 0 ? 'junior' : 'senior',
      title: program.title || '',
      description: program.description || '',
      image: program.image || '',
      isVisible: true,
    })),
    'program-tab',
    () => mapped.academicsPage.programTabs
  )

  mapped.academicsPage.curriculumBlocks = withIds(
    (extra.curriculum_overview || []).map((item) => ({
      title: item,
      description: '',
      isVisible: true,
    })),
    'curriculum',
    () => mapped.academicsPage.curriculumBlocks
  )

  mapped.academicsPage.facilitySections = withIds(
    (extra.facilities || []).map((facility) => ({
      title: facility.title || '',
      description: facility.description || '',
      image: facility.image || '',
      isVisible: true,
    })),
    'facility',
    () => mapped.academicsPage.facilitySections
  )

  mapped.admissionsPage.steps = withIds(
    (extra.admissions_steps || []).map((step) => ({
      title: step.title || '',
      description: step.description || '',
      isVisible: true,
    })),
    'admission-step',
    () => mapped.admissionsPage.steps
  )

  mapped.admissionsPage.requirements = withIds(
    (extra.admissions_requirements || []).map((value) => ({ value, isVisible: true })),
    'admission-requirement',
    () => mapped.admissionsPage.requirements
  )

  mapped.admissionsPage.forms = withIds(
    (extra.admissions_forms || []).map((form) => ({
      label: form.label || '',
      url: form.url || '',
      isVisible: true,
    })),
    'admission-form',
    () => mapped.admissionsPage.forms
  )

  mapped.contactPage.email = content?.contact_email || mapped.contactPage.email
  mapped.contactPage.phone = content?.contact_phone || mapped.contactPage.phone
  mapped.contactPage.recipientEmail = content?.contact_email || mapped.contactPage.recipientEmail

  if (Array.isArray(extra.buildings) && extra.buildings.length) {
    mapped.gallerySettings.featuredImage = extra.buildings[0]?.image || ''
  }

  return mapped
}

export function normalizeSiteManagement(input, legacyContent = null) {
  const baseDefaults = createSiteManagementDefaults()
  const legacySeed = legacyContent ? legacyToSiteManagement(legacyContent) : baseDefaults
  const merged = deepMerge(legacySeed, input || {})

  merged.homepage.hero.statCards = withIds(merged.homepage.hero.statCards, 'hero-stat', () => baseDefaults.homepage.hero.statCards)
  merged.homepage.trustBadges = withIds(merged.homepage.trustBadges, 'trust', () => baseDefaults.homepage.trustBadges)
  merged.homepage.sections = withIds(merged.homepage.sections, 'home-section', () => baseDefaults.homepage.sections)

  merged.aboutPage.timeline = withIds(merged.aboutPage.timeline, 'about-timeline', () => baseDefaults.aboutPage.timeline)
  merged.aboutPage.coreValues = withIds(merged.aboutPage.coreValues, 'core-value', () => baseDefaults.aboutPage.coreValues)

  merged.academicsPage.programTabs = withIds(
    merged.academicsPage.programTabs,
    'program-tab',
    () => baseDefaults.academicsPage.programTabs
  )
  merged.academicsPage.curriculumBlocks = withIds(
    merged.academicsPage.curriculumBlocks,
    'curriculum',
    () => baseDefaults.academicsPage.curriculumBlocks
  )
  merged.academicsPage.facilitySections = withIds(
    merged.academicsPage.facilitySections,
    'facility',
    () => baseDefaults.academicsPage.facilitySections
  )

  merged.admissionsPage.steps = withIds(merged.admissionsPage.steps, 'admission-step', () => baseDefaults.admissionsPage.steps)
  merged.admissionsPage.requirements = withIds(
    merged.admissionsPage.requirements,
    'admission-requirement',
    () => baseDefaults.admissionsPage.requirements
  )
  merged.admissionsPage.forms = withIds(merged.admissionsPage.forms, 'admission-form', () => baseDefaults.admissionsPage.forms)
  merged.admissionsPage.transportation.cards = withIds(
    merged.admissionsPage.transportation.cards,
    'transport-card',
    () => baseDefaults.admissionsPage.transportation.cards
  )
  merged.admissionsPage.highlightCards = withIds(
    merged.admissionsPage.highlightCards,
    'admission-highlight',
    () => baseDefaults.admissionsPage.highlightCards
  )

  merged.gallerySettings.categories = withIds(
    merged.gallerySettings.categories,
    'gallery-category',
    () => baseDefaults.gallerySettings.categories
  )

  merged.footer.socialLinks = withIds(merged.footer.socialLinks, 'footer-social', () => baseDefaults.footer.socialLinks)
  merged.footer.navLinks = withIds(merged.footer.navLinks, 'footer-nav', () => baseDefaults.footer.navLinks)

  return merged
}

function mirrorLegacyFieldsFromManagement(content, management) {
  const safe = content || {}
  const extra = { ...(safe.extra_content || {}) }

  const timelineSummary = (management.aboutPage.timeline || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => item.year?.trim() ? `${item.year}: ${item.description}` : item.description)
    .filter(Boolean)
    .join(' ')

  extra.about_intro = management.aboutPage.intro || ''
  extra.principal_message = management.aboutPage.principalMessage || ''
  extra.core_values = (management.aboutPage.coreValues || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => item.value)
    .filter(Boolean)

  extra.programs = (management.academicsPage.programTabs || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => ({ title: item.title || '', description: item.description || '' }))

  extra.curriculum_overview = (management.academicsPage.curriculumBlocks || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => item.title || '')
    .filter(Boolean)

  extra.facilities = (management.academicsPage.facilitySections || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => ({ title: item.title || '', description: item.description || '' }))

  extra.admissions_steps = (management.admissionsPage.steps || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => ({ title: item.title || '', description: item.description || '' }))

  extra.admissions_requirements = (management.admissionsPage.requirements || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => item.value || '')
    .filter(Boolean)

  extra.admissions_forms = (management.admissionsPage.forms || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => ({ label: item.label || '', url: item.url || '' }))

  extra.transport_program = {
    title: management.admissionsPage.transportation.title || '',
    subtitle: management.admissionsPage.transportation.subtitle || '',
    cards: (management.admissionsPage.transportation.cards || [])
      .filter((item) => item.isVisible !== false)
      .map((item) => ({ title: item.title || '', description: item.description || '' })),
  }

  extra.buildings = (management.academicsPage.facilitySections || [])
    .filter((item) => item.isVisible !== false)
    .map((item) => ({
      title: item.title || '',
      department: item.description || '',
      image: item.image || '',
    }))

  return {
    ...safe,
    vision: management.aboutPage.vision || '',
    mission: management.aboutPage.mission || '',
    history: timelineSummary,
    contact_email: management.contactPage.email || '',
    contact_phone: management.contactPage.phone || '',
    extra_content: extra,
  }
}

function buildPayload(content, draft, published, history, meta) {
  const mirrored = mirrorLegacyFieldsFromManagement(content, published || draft)
  return {
    ...mirrored,
    extra_content: {
      ...(mirrored.extra_content || {}),
      [DRAFT_KEY]: draft,
      [PUBLISHED_KEY]: published,
      [HISTORY_KEY]: history,
      [META_KEY]: meta,
    },
  }
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter((item) => item && item.data)
    .slice(0, HISTORY_LIMIT)
    .map((item) => ({
      version: Number(item.version) || 1,
      published_at: item.published_at || null,
      note: item.note || '',
      data: normalizeSiteManagement(item.data),
    }))
}

export function readPublishedSiteManagementFromContent(content) {
  const extra = content?.extra_content || {}
  const published = extra[PUBLISHED_KEY]
  return normalizeSiteManagement(published, content)
}

export async function fetchSiteManagement() {
  const { data: content } = await fetchSiteContent()
  const extra = content?.extra_content || {}

  const normalizedPublished = normalizeSiteManagement(extra[PUBLISHED_KEY], content)
  const normalizedDraft = normalizeSiteManagement(extra[DRAFT_KEY] || normalizedPublished, content)
  const history = sanitizeHistory(extra[HISTORY_KEY])

  const defaultMeta = {
    version: history[0]?.version || 1,
    last_saved_at: content?.updated_at || null,
    last_published_at: history[0]?.published_at || null,
  }

  const meta = {
    ...defaultMeta,
    ...(extra[META_KEY] || {}),
  }

  return {
    data: {
      content,
      draft: normalizedDraft,
      published: normalizedPublished,
      history,
      meta,
    },
  }
}

export async function saveSiteManagementDraft(draftPayload) {
  const { data: current } = await fetchSiteManagement()
  const nextDraft = normalizeSiteManagement(draftPayload, current.content)
  const nextMeta = {
    ...(current.meta || {}),
    last_saved_at: new Date().toISOString(),
  }

  const payload = buildPayload(current.content, nextDraft, current.published, current.history, nextMeta)
  const { data } = await saveSiteContent(payload)

  return {
    data: {
      content: data,
      draft: nextDraft,
      published: current.published,
      history: current.history,
      meta: nextMeta,
    },
  }
}

export async function publishSiteManagement(draftPayload, note = '') {
  const { data: current } = await fetchSiteManagement()
  const now = new Date().toISOString()
  const nextDraft = normalizeSiteManagement(draftPayload, current.content)
  const nextVersion = Number(current.meta?.version || current.history?.[0]?.version || 1) + 1

  const snapshot = {
    version: nextVersion,
    published_at: now,
    note: note || '',
    data: nextDraft,
  }

  const nextHistory = [snapshot, ...sanitizeHistory(current.history)].slice(0, HISTORY_LIMIT)
  const nextMeta = {
    version: nextVersion,
    last_saved_at: now,
    last_published_at: now,
  }

  const payload = buildPayload(current.content, nextDraft, nextDraft, nextHistory, nextMeta)
  const { data } = await saveSiteContent(payload)

  return {
    data: {
      content: data,
      draft: nextDraft,
      published: nextDraft,
      history: nextHistory,
      meta: nextMeta,
    },
  }
}

export async function resetSiteManagementDraftToPublished() {
  const { data: current } = await fetchSiteManagement()
  return saveSiteManagementDraft(current.published)
}

export async function restoreSiteManagementVersion(version) {
  const { data: current } = await fetchSiteManagement()
  const match = (current.history || []).find((entry) => Number(entry.version) === Number(version))
  if (!match?.data) {
    throw new Error('Selected version was not found in history.')
  }

  return saveSiteManagementDraft(match.data)
}

export function duplicateSectionItem(item, prefix = 'item') {
  const cloneItem = clone(item)
  cloneItem.id = createId(prefix)
  return cloneItem
}
