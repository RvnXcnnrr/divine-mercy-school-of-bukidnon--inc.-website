import { useEffect, useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { FiAlertCircle, FiCheckCircle, FiClock, FiCopy, FiRefreshCcw, FiSave, FiSend, FiUpload } from 'react-icons/fi'
import usePageMeta from '../../hooks/usePageMeta.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import SortableCardsEditor from '../../components/admin/SortableCardsEditor.jsx'
import AdminRichTextEditor from '../../components/admin/AdminRichTextEditor.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'
import {
  duplicateSectionItem,
  fetchSiteManagement,
  publishSiteManagement,
  resetSiteManagementDraftToPublished,
  restoreSiteManagementVersion,
  saveSiteManagementDraft,
} from '../../services/siteManagementService.js'
import { uploadFileToSupabase, uploadImageToSupabase } from '../../lib/supabaseStorage.js'
import { createId } from '../../data/siteManagementDefaults.js'

const SECTIONS = [
  { key: 'homepage', label: 'Homepage' },
  { key: 'about', label: 'About Page' },
  { key: 'academics', label: 'Academics Page' },
  { key: 'admissions', label: 'Admissions Page' },
  { key: 'events', label: 'Events Settings' },
  { key: 'gallery', label: 'Gallery Settings' },
  { key: 'contact', label: 'Contact Page' },
  { key: 'footer', label: 'Footer' },
  { key: 'global', label: 'Global Settings' },
]

const SECTION_LOOKUP = Object.fromEntries(SECTIONS.map((entry) => [entry.key, entry.label]))
const HOME_SECTION_TYPE_OPTIONS = [
  { value: 'Highlight', label: 'Highlight' },
  { value: 'CTA', label: 'Action Button Block' },
  { value: 'Image + Text', label: 'Image + Text' },
  { value: 'Stats', label: 'Stats' },
  { value: 'Feature Cards', label: 'Feature Cards' },
  { value: 'Announcement Banner', label: 'Announcement Banner' },
]

function asDateLabel(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-brand-goldText focus:ring-brand-goldText"
      />
    </label>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="admin-input mt-1"
      />
    </label>
  )
}

function TextAreaField({ label, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="admin-input mt-1"
      />
    </label>
  )
}

function Toast({ message, type }) {
  if (!message) return null
  const Icon = type === 'error' ? FiAlertCircle : FiCheckCircle
  const tone = type === 'error' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'

  return (
    <div className={`fixed right-4 top-20 z-[180] rounded-xl border px-4 py-2 text-sm font-semibold shadow-xl ${tone}`}>
      <p className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {message}
      </p>
    </div>
  )
}

function uploadButton({ label = 'Upload image', accept = 'image/*', onPick }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-brand-goldText">
      <FiUpload className="h-4 w-4" aria-hidden="true" />
      {label}
      <input type="file" accept={accept} className="sr-only" onChange={(event) => onPick(event.target.files?.[0])} />
    </label>
  )
}

export default function AdminSiteManagement() {
  const { section } = useParams()
  const activeSection = SECTION_LOOKUP[section] ? section : 'homepage'

  usePageMeta({ title: `Site Management - ${SECTION_LOOKUP[activeSection]}` })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(null)
  const [published, setPublished] = useState(null)
  const [meta, setMeta] = useState(null)
  const [history, setHistory] = useState([])
  const [publishNote, setPublishNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [heroSaving, setHeroSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await fetchSiteManagement()
        if (!alive) return
        setDraft(data.draft)
        setPublished(data.published)
        setMeta(data.meta)
        setHistory(data.history || [])
      } catch (loadError) {
        if (!alive) return
        setError(loadError.message || 'Failed to load site management data.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!toast.message) return undefined
    const id = setTimeout(() => setToast({ message: '', type: 'success' }), 2800)
    return () => clearTimeout(id)
  }, [toast])

  const visibleHeroStats = useMemo(
    () => (draft?.homepage?.hero?.statCards || []).filter((item) => item.isVisible !== false).slice(0, 3),
    [draft?.homepage?.hero?.statCards]
  )

  function patchDraft(updater) {
    setDraft((prev) => updater(prev))
    setDirty(true)
  }

  function setSuccess(message) {
    setToast({ message, type: 'success' })
  }

  function setFailure(message) {
    setToast({ message, type: 'error' })
  }

  async function uploadImage(file, onUrl) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadImageToSupabase(file, { bucket: 'gallery' })
      onUrl(result.publicUrl)
      setSuccess('Image uploaded.')
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed.')
      setFailure(uploadError.message || 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function uploadForm(file, onUrl) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadFileToSupabase(file, { bucket: 'forms' })
      onUrl(result.publicUrl)
      setSuccess('File uploaded.')
    } catch (uploadError) {
      setError(uploadError.message || 'File upload failed.')
      setFailure(uploadError.message || 'File upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function saveDraft() {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      const { data } = await saveSiteManagementDraft(draft)
      setDraft(data.draft)
      setPublished(data.published)
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(false)
      setSuccess('Draft saved.')
    } catch (saveError) {
      setError(saveError.message || 'Failed to save draft.')
      setFailure(saveError.message || 'Failed to save draft.')
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    if (!draft) return
    setPublishing(true)
    setError('')
    try {
      const { data } = await publishSiteManagement(draft, publishNote)
      setDraft(data.draft)
      setPublished(data.published)
      setMeta(data.meta)
      setHistory(data.history || [])
      setPublishNote('')
      setDirty(false)
      setSuccess(`Published version ${data.meta?.version || ''}.`)
    } catch (publishError) {
      setError(publishError.message || 'Failed to publish.')
      setFailure(publishError.message || 'Failed to publish.')
    } finally {
      setPublishing(false)
    }
  }

  async function saveAndPublishHero() {
    if (!draft) return
    setHeroSaving(true)
    setError('')
    try {
      const { data } = await publishSiteManagement(draft, 'Hero updated')
      setDraft(data.draft)
      setPublished(data.published)
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(false)
      setSuccess('Hero changes are now live.')
    } catch (heroError) {
      setError(heroError.message || 'Failed to publish hero changes.')
      setFailure(heroError.message || 'Failed to publish hero changes.')
    } finally {
      setHeroSaving(false)
    }
  }

  async function resetDraft() {
    setSaving(true)
    setError('')
    try {
      const { data } = await resetSiteManagementDraftToPublished()
      setDraft(data.draft)
      setPublished(data.published)
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(false)
      setSuccess('Draft reset to published content.')
    } catch (resetError) {
      setError(resetError.message || 'Failed to reset draft.')
      setFailure(resetError.message || 'Failed to reset draft.')
    } finally {
      setSaving(false)
    }
  }

  async function restoreVersion(version) {
    setSaving(true)
    setError('')
    try {
      const { data } = await restoreSiteManagementVersion(version)
      setDraft(data.draft)
      setPublished(data.published)
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(true)
      setSuccess(`Version ${version} restored to draft.`)
    } catch (restoreError) {
      setError(restoreError.message || 'Failed to restore version.')
      setFailure(restoreError.message || 'Failed to restore version.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !draft || !published || !meta) {
    return <LoadingOverlay message="Loading Site Management..." />
  }

  function updateHome(updater) {
    patchDraft((prev) => ({ ...prev, homepage: updater(prev.homepage) }))
  }

  function updateAbout(updater) {
    patchDraft((prev) => ({ ...prev, aboutPage: updater(prev.aboutPage) }))
  }

  function updateAcademics(updater) {
    patchDraft((prev) => ({ ...prev, academicsPage: updater(prev.academicsPage) }))
  }

  function updateAdmissions(updater) {
    patchDraft((prev) => ({ ...prev, admissionsPage: updater(prev.admissionsPage) }))
  }

  function updateEvents(updater) {
    patchDraft((prev) => ({ ...prev, eventsSettings: updater(prev.eventsSettings) }))
  }

  function updateGallery(updater) {
    patchDraft((prev) => ({ ...prev, gallerySettings: updater(prev.gallerySettings) }))
  }

  function updateContact(updater) {
    patchDraft((prev) => ({ ...prev, contactPage: updater(prev.contactPage) }))
  }

  function updateFooter(updater) {
    patchDraft((prev) => ({ ...prev, footer: updater(prev.footer) }))
  }

  function updateGlobal(updater) {
    patchDraft((prev) => ({ ...prev, globalSettings: updater(prev.globalSettings) }))
  }

  function duplicateIn(list, index, prefix) {
    const next = [...list]
    next.splice(index + 1, 0, duplicateSectionItem(list[index], prefix))
    return next
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Site Management"
        description="Manage every public page section with draft/publish controls."
        actions={
          <>
            <button type="button" onClick={() => setConfirmReset(true)} className="admin-button-secondary" disabled={!dirty || saving || publishing}>
              <FiRefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset Draft
            </button>
            <button type="button" onClick={saveDraft} className="admin-button-secondary" disabled={saving || publishing}>
              <FiSave className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button type="button" onClick={() => setConfirmPublish(true)} className="admin-button-primary" disabled={saving || publishing}>
              <FiSend className="h-4 w-4" aria-hidden="true" />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </>
        }
      />

      <article className="admin-card p-4">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="inline-flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
              <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
              Version {meta.version || 1}
            </span>
            <span>Last saved: {asDateLabel(meta.last_saved_at)}</span>
            <span>Last published: {asDateLabel(meta.last_published_at)}</span>
            {dirty ? <span className="font-semibold text-amber-700">Unsaved changes</span> : <span className="font-semibold text-emerald-700">Draft synced</span>}
          </div>
          <InputField label="Publish note" value={publishNote} onChange={setPublishNote} placeholder="Optional release notes" />
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}
      </article>

      <nav className="admin-card p-2" aria-label="Site management sections">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {SECTIONS.map((entry) => (
            <NavLink
              key={entry.key}
              to={`/admin/site/${entry.key}`}
              className={({ isActive }) =>
                [
                  'rounded-xl px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-brand-goldText text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100',
                ].join(' ')
              }
            >
              {entry.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {activeSection === 'homepage' ? (
        <div className="space-y-4">
          <article className="admin-card p-5">
            <h2 className="text-base font-semibold text-slate-900">Hero Section Editor</h2>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              <div className="space-y-3">
                <InputField label="Hero title" value={draft.homepage.hero.title} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, title: value } }))} />
                <TextAreaField label="Hero subtitle" value={draft.homepage.hero.subtitle} rows={4} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, subtitle: value } }))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField label="Primary button text" value={draft.homepage.hero.ctaPrimaryText} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, ctaPrimaryText: value } }))} />
                  <InputField label="Secondary button text" value={draft.homepage.hero.ctaSecondaryText} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, ctaSecondaryText: value } }))} />
                </div>
                {uploadButton({
                  label: 'Upload background image',
                  onPick: (file) => uploadImage(file, (url) => updateHome((home) => ({ ...home, hero: { ...home.hero, backgroundImage: url } }))),
                })}
                <InputField
                  label="Focus panel label"
                  value={draft.homepage.hero.focusLabel}
                  onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, focusLabel: value } }))}
                />
                <TextAreaField
                  label="Focus panel text"
                  rows={3}
                  value={draft.homepage.hero.focusText}
                  onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, focusText: value } }))}
                />
                {uploadButton({
                  label: 'Upload focus panel image',
                  onPick: (file) => uploadImage(file, (url) => updateHome((home) => ({ ...home, hero: { ...home.hero, focusImage: url } }))),
                })}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <button
                    type="button"
                    onClick={saveAndPublishHero}
                    disabled={heroSaving || saving || publishing}
                    className="admin-button-primary"
                  >
                    <FiSave className="h-4 w-4" aria-hidden="true" />
                    {heroSaving ? 'Publishing Hero...' : 'Save & Publish Hero'}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ToggleField label="Enable animated counters" checked={draft.homepage.hero.enableAnimatedCounters} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, enableAnimatedCounters: value } }))} />
                  <ToggleField label="Enable parallax" checked={draft.homepage.hero.enableParallax} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, enableParallax: value } }))} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Live Preview</p>
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-red-700 to-rose-600 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">{draft.globalSettings.schoolName}</p>
                  <h3 className="mt-2 text-2xl font-extrabold">{draft.homepage.hero.title}</h3>
                  <p className="mt-2 text-sm text-white/85">{draft.homepage.hero.subtitle}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {visibleHeroStats.map((item) => (
                      <div key={item.id} className="rounded-xl bg-white/15 p-3 text-center ring-1 ring-white/20">
                        <p className="text-lg font-black">{item.value || '--'}</p>
                        <p className="text-[11px] font-semibold uppercase">{item.label || 'Stat'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SortableCardsEditor
              title="Hero Stat Cards"
              description="Drag-and-drop reorder for floating cards."
              items={draft.homepage.hero.statCards}
              addLabel="Add stat card"
              onAdd={() => updateHome((home) => ({ ...home, hero: { ...home.hero, statCards: [...home.hero.statCards, { id: createId('hero-stat'), label: '', value: '', icon: '', isVisible: true }] } }))}
              onChange={(items) => updateHome((home) => ({ ...home, hero: { ...home.hero, statCards: items } }))}
              onDuplicate={(_, index) => updateHome((home) => ({ ...home, hero: { ...home.hero, statCards: duplicateIn(home.hero.statCards, index, 'hero-stat') } }))}
              renderBody={({ item, updateItem }) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField label="Label" value={item.label} onChange={(value) => updateItem({ label: value })} />
                  <InputField label="Value" value={item.value} onChange={(value) => updateItem({ value: value })} />
                  <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                </div>
              )}
            />
          </article>

          <SortableCardsEditor
            title="Trust Badges Manager"
            description="Add/edit badges, upload icon, reorder, toggle visibility."
            items={draft.homepage.trustBadges}
            addLabel="Add badge"
            onAdd={() => updateHome((home) => ({ ...home, trustBadges: [...home.trustBadges, { id: createId('trust'), label: '', icon: '', image: '', isVisible: true }] }))}
            onChange={(items) => updateHome((home) => ({ ...home, trustBadges: items }))}
            onDuplicate={(_, index) => updateHome((home) => ({ ...home, trustBadges: duplicateIn(home.trustBadges, index, 'trust') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Badge label" value={item.label} onChange={(value) => updateItem({ label: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Homepage Sections Builder"
            description="Dynamic blocks with publish/unpublish toggles."
            items={draft.homepage.sections}
            addLabel="Add section"
            onAdd={() => updateHome((home) => ({ ...home, sections: [...home.sections, { id: createId('home-section'), type: 'Highlight', title: '', content: '', image: '', ctaText: '', ctaLink: '', isPublished: false }] }))}
            onChange={(items) => updateHome((home) => ({ ...home, sections: items }))}
            onDuplicate={(_, index) => updateHome((home) => ({ ...home, sections: duplicateIn(home.sections, index, 'home-section') }))}
            renderBody={({ item, updateItem }) => (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Section type</span>
                  <select value={item.type} onChange={(event) => updateItem({ type: event.target.value })} className="admin-input mt-1">
                    {HOME_SECTION_TYPE_OPTIONS.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                </label>
                <InputField label="Title" value={item.title} onChange={(value) => updateItem({ title: value })} />
                <TextAreaField label="Content" value={item.content} rows={4} onChange={(value) => updateItem({ content: value })} />
                <ToggleField label="Published" checked={item.isPublished !== false} onChange={(value) => updateItem({ isPublished: value })} />
              </div>
            )}
          />

          <article className="admin-card p-5">
            <h3 className="text-base font-semibold text-slate-900">News Settings Manager</h3>
            <p className="mt-1 text-sm text-slate-500">Configure featured news visibility, layout style, and pagination controls.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ToggleField
                label="Show featured"
                checked={draft.homepage.featuredNews.showFeatured}
                onChange={(value) => updateHome((home) => ({ ...home, featuredNews: { ...home.featuredNews, showFeatured: value } }))}
              />
              <ToggleField
                label="Enable category filters"
                checked={draft.homepage.featuredNews.enableCategoryFilters}
                onChange={(value) => updateHome((home) => ({ ...home, featuredNews: { ...home.featuredNews, enableCategoryFilters: value } }))}
              />
              <InputField
                label="Posts per page"
                type="number"
                value={String(draft.homepage.featuredNews.postsPerPage || 6)}
                onChange={(value) =>
                  updateHome((home) => ({ ...home, featuredNews: { ...home.featuredNews, postsPerPage: Number(value) || 6 } }))
                }
              />
              <InputField
                label="Pagination size"
                type="number"
                value={String(draft.homepage.featuredNews.paginationSize || 6)}
                onChange={(value) =>
                  updateHome((home) => ({ ...home, featuredNews: { ...home.featuredNews, paginationSize: Number(value) || 6 } }))
                }
              />
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Layout style</span>
                <select
                  value={draft.homepage.featuredNews.layoutStyle}
                  onChange={(event) => updateHome((home) => ({ ...home, featuredNews: { ...home.featuredNews, layoutStyle: event.target.value } }))}
                  className="admin-input mt-1"
                >
                  <option value="cards">Cards</option>
                  <option value="list">List</option>
                  <option value="magazine">Magazine</option>
                </select>
              </label>
            </div>
          </article>
        </div>
      ) : null}

      {activeSection === 'about' ? (
        <div className="space-y-4">
          <article className="admin-card p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">About Page Manager</h2>
            <TextAreaField label="About intro" rows={3} value={draft.aboutPage.intro} onChange={(value) => updateAbout((about) => ({ ...about, intro: value }))} />
            <AdminRichTextEditor label="Mission" value={draft.aboutPage.mission} onChange={(value) => updateAbout((about) => ({ ...about, mission: value }))} />
            <AdminRichTextEditor label="Vision" value={draft.aboutPage.vision} onChange={(value) => updateAbout((about) => ({ ...about, vision: value }))} />
            <AdminRichTextEditor label="Principal message" value={draft.aboutPage.principalMessage} onChange={(value) => updateAbout((about) => ({ ...about, principalMessage: value }))} />
            <ToggleField label="Show faculty section" checked={draft.aboutPage.showFacultySection} onChange={(value) => updateAbout((about) => ({ ...about, showFacultySection: value }))} />
          </article>

          <SortableCardsEditor
            title="Timeline Editor"
            description="Draggable timeline entries."
            items={draft.aboutPage.timeline}
            addLabel="Add timeline item"
            onAdd={() => updateAbout((about) => ({ ...about, timeline: [...about.timeline, { id: createId('about-timeline'), year: '', description: '', isVisible: true }] }))}
            onChange={(items) => updateAbout((about) => ({ ...about, timeline: items }))}
            onDuplicate={(_, index) => updateAbout((about) => ({ ...about, timeline: duplicateIn(about.timeline, index, 'about-timeline') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField label="Year" value={item.year} onChange={(value) => updateItem({ year: value })} />
                <TextAreaField label="Description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />
        </div>
      ) : null}

      {activeSection === 'academics' ? (
        <div className="space-y-4">
          <SortableCardsEditor
            title="Program Tabs"
            description="Add and reorder program tabs."
            items={draft.academicsPage.programTabs}
            addLabel="Add program tab"
            onAdd={() => updateAcademics((page) => ({ ...page, programTabs: [...page.programTabs, { id: createId('program-tab'), key: '', title: '', description: '', image: '', isVisible: true }] }))}
            onChange={(items) => updateAcademics((page) => ({ ...page, programTabs: items }))}
            onDuplicate={(_, index) => updateAcademics((page) => ({ ...page, programTabs: duplicateIn(page.programTabs, index, 'program-tab') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Program key" value={item.key} onChange={(value) => updateItem({ key: value })} />
                <InputField label="Title" value={item.title} onChange={(value) => updateItem({ title: value })} />
                <TextAreaField label="Description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} />
                <InputField label="Image URL" value={item.image} onChange={(value) => updateItem({ image: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                {uploadButton({ label: 'Upload tab image', onPick: (file) => uploadImage(file, (url) => updateItem({ image: url })) })}
              </div>
            )}
          />

          <SortableCardsEditor
            title="Curriculum Blocks"
            description="Manage curriculum accordion entries."
            items={draft.academicsPage.curriculumBlocks}
            addLabel="Add block"
            onAdd={() => updateAcademics((page) => ({ ...page, curriculumBlocks: [...page.curriculumBlocks, { id: createId('curriculum'), title: '', description: '', isVisible: true }] }))}
            onChange={(items) => updateAcademics((page) => ({ ...page, curriculumBlocks: items }))}
            onDuplicate={(_, index) => updateAcademics((page) => ({ ...page, curriculumBlocks: duplicateIn(page.curriculumBlocks, index, 'curriculum') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Title" value={item.title} onChange={(value) => updateItem({ title: value })} />
                <TextAreaField label="Description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />
        </div>
      ) : null}

      {activeSection === 'admissions' ? (
        <div className="space-y-4">
          <SortableCardsEditor
            title="Admission Steps"
            description="Add/edit/reorder timeline steps."
            items={draft.admissionsPage.steps}
            addLabel="Add step"
            onAdd={() => updateAdmissions((page) => ({ ...page, steps: [...page.steps, { id: createId('admission-step'), title: '', description: '', isVisible: true }] }))}
            onChange={(items) => updateAdmissions((page) => ({ ...page, steps: items }))}
            onDuplicate={(_, index) => updateAdmissions((page) => ({ ...page, steps: duplicateIn(page.steps, index, 'admission-step') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Title" value={item.title} onChange={(value) => updateItem({ title: value })} />
                <TextAreaField label="Description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Requirements Checklist"
            description="Checklist rows with reordering."
            items={draft.admissionsPage.requirements}
            addLabel="Add requirement"
            onAdd={() => updateAdmissions((page) => ({ ...page, requirements: [...page.requirements, { id: createId('admission-requirement'), value: '', isVisible: true }] }))}
            onChange={(items) => updateAdmissions((page) => ({ ...page, requirements: items }))}
            onDuplicate={(_, index) => updateAdmissions((page) => ({ ...page, requirements: duplicateIn(page.requirements, index, 'admission-requirement') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Requirement" value={item.value} onChange={(value) => updateItem({ value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Downloadable Forms"
            description="Upload and manage admission form downloads."
            items={draft.admissionsPage.forms}
            addLabel="Add form"
            onAdd={() => updateAdmissions((page) => ({ ...page, forms: [...page.forms, { id: createId('admission-form'), label: '', url: '', isVisible: true }] }))}
            onChange={(items) => updateAdmissions((page) => ({ ...page, forms: items }))}
            onDuplicate={(_, index) => updateAdmissions((page) => ({ ...page, forms: duplicateIn(page.forms, index, 'admission-form') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Label" value={item.label} onChange={(value) => updateItem({ label: value })} />
                <InputField label="File URL" value={item.url} onChange={(value) => updateItem({ url: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                {uploadButton({
                  label: 'Upload file',
                  accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
                  onPick: (file) => uploadForm(file, (url) => updateItem({ url })),
                })}
              </div>
            )}
          />

          <article className="admin-card p-5 space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Transportation Program and Action Button</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                label="Transport title"
                value={draft.admissionsPage.transportation.title}
                onChange={(value) =>
                  updateAdmissions((page) => ({
                    ...page,
                    transportation: { ...page.transportation, title: value },
                  }))
                }
              />
              <TextAreaField
                label="Transport subtitle"
                rows={3}
                value={draft.admissionsPage.transportation.subtitle}
                onChange={(value) =>
                  updateAdmissions((page) => ({
                    ...page,
                    transportation: { ...page.transportation, subtitle: value },
                  }))
                }
              />
              <InputField
                label="Action section title"
                value={draft.admissionsPage.cta.title}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, title: value } }))}
              />
              <TextAreaField
                label="Action section subtitle"
                rows={3}
                value={draft.admissionsPage.cta.subtitle}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, subtitle: value } }))}
              />
              <InputField
                label="Action button text"
                value={draft.admissionsPage.cta.primaryText}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, primaryText: value } }))}
              />
              <InputField
                label="Action button link"
                value={draft.admissionsPage.cta.primaryLink}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, primaryLink: value } }))}
              />
            </div>
          </article>
        </div>
      ) : null}

      {activeSection === 'events' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Events Settings Manager</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField label="Show featured event" checked={draft.eventsSettings.showFeaturedEvent} onChange={(value) => updateEvents((page) => ({ ...page, showFeaturedEvent: value }))} />
            <ToggleField label="Enable countdown" checked={draft.eventsSettings.enableCountdown} onChange={(value) => updateEvents((page) => ({ ...page, enableCountdown: value }))} />
            <ToggleField label="Show Add to Calendar" checked={draft.eventsSettings.showAddToCalendar} onChange={(value) => updateEvents((page) => ({ ...page, showAddToCalendar: value }))} />
            <InputField label="Featured event ID" value={draft.eventsSettings.featuredEventId} onChange={(value) => updateEvents((page) => ({ ...page, featuredEventId: value }))} />
            <InputField label="Banner image URL" value={draft.eventsSettings.eventBannerImage} onChange={(value) => updateEvents((page) => ({ ...page, eventBannerImage: value }))} />
            {uploadButton({ label: 'Upload event banner', onPick: (file) => uploadImage(file, (url) => updateEvents((page) => ({ ...page, eventBannerImage: url }))) })}
          </div>
        </article>
      ) : null}

      {activeSection === 'gallery' ? (
        <div className="space-y-4">
          <SortableCardsEditor
            title="Gallery Categories"
            description="Drag-and-drop category order and toggle visibility."
            items={draft.gallerySettings.categories}
            addLabel="Add category"
            onAdd={() => updateGallery((page) => ({ ...page, categories: [...page.categories, { id: createId('gallery-category'), name: '', slug: '', isVisible: true }] }))}
            onChange={(items) => updateGallery((page) => ({ ...page, categories: items }))}
            onDuplicate={(_, index) => updateGallery((page) => ({ ...page, categories: duplicateIn(page.categories, index, 'gallery-category') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField label="Name" value={item.name} onChange={(value) => updateItem({ name: value })} />
                <InputField label="Slug" value={item.slug} onChange={(value) => updateItem({ slug: value })} />
                <ToggleField label="Visible" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <article className="admin-card p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Gallery Settings</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField label="Featured gallery title" value={draft.gallerySettings.featuredGalleryTitle} onChange={(value) => updateGallery((page) => ({ ...page, featuredGalleryTitle: value }))} />
              <TextAreaField label="Featured gallery description" rows={3} value={draft.gallerySettings.featuredGalleryDescription} onChange={(value) => updateGallery((page) => ({ ...page, featuredGalleryDescription: value }))} />
              <InputField label="Featured image URL" value={draft.gallerySettings.featuredImage} onChange={(value) => updateGallery((page) => ({ ...page, featuredImage: value }))} />
              <InputField label="Default caption" value={draft.gallerySettings.defaultCaption} onChange={(value) => updateGallery((page) => ({ ...page, defaultCaption: value }))} />
              <ToggleField label="Enable lightbox" checked={draft.gallerySettings.enableLightbox} onChange={(value) => updateGallery((page) => ({ ...page, enableLightbox: value }))} />
              {uploadButton({ label: 'Upload featured image', onPick: (file) => uploadImage(file, (url) => updateGallery((page) => ({ ...page, featuredImage: url }))) })}
            </div>
          </article>
        </div>
      ) : null}

      {activeSection === 'contact' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Contact Page Manager</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField label="Address" value={draft.contactPage.address} onChange={(value) => updateContact((page) => ({ ...page, address: value }))} />
            <InputField label="Phone" value={draft.contactPage.phone} onChange={(value) => updateContact((page) => ({ ...page, phone: value }))} />
            <InputField label="Email" type="email" value={draft.contactPage.email} onChange={(value) => updateContact((page) => ({ ...page, email: value }))} />
            <InputField label="Office hours" value={draft.contactPage.officeHours} onChange={(value) => updateContact((page) => ({ ...page, officeHours: value }))} />
            <TextAreaField label="Map embed link" rows={3} value={draft.contactPage.mapEmbedUrl} onChange={(value) => updateContact((page) => ({ ...page, mapEmbedUrl: value }))} />
            <InputField label="Messenger link" value={draft.contactPage.messengerLink} onChange={(value) => updateContact((page) => ({ ...page, messengerLink: value }))} />
            <InputField label="Enrollment form link" value={draft.contactPage.enrollmentFormLink} onChange={(value) => updateContact((page) => ({ ...page, enrollmentFormLink: value }))} />
            <InputField label="Contact form recipient email" type="email" value={draft.contactPage.recipientEmail} onChange={(value) => updateContact((page) => ({ ...page, recipientEmail: value }))} />
          </div>
        </article>
      ) : null}

      {activeSection === 'footer' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Footer Manager</h2>
          <TextAreaField label="Footer description" rows={4} value={draft.footer.description} onChange={(value) => updateFooter((page) => ({ ...page, description: value }))} />
          <InputField label="Copyright text" value={draft.footer.copyrightText} onChange={(value) => updateFooter((page) => ({ ...page, copyrightText: value }))} />
          <ToggleField label="Show developer credit" checked={draft.footer.showDeveloperCredit} onChange={(value) => updateFooter((page) => ({ ...page, showDeveloperCredit: value }))} />
          <InputField label="Developer credit" value={draft.footer.developerCredit} onChange={(value) => updateFooter((page) => ({ ...page, developerCredit: value }))} />
        </article>
      ) : null}

      {activeSection === 'global' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Global Settings Panel</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField label="School name" value={draft.globalSettings.schoolName} onChange={(value) => updateGlobal((page) => ({ ...page, schoolName: value }))} />
            <InputField label="Logo URL" value={draft.globalSettings.logoUrl} onChange={(value) => updateGlobal((page) => ({ ...page, logoUrl: value }))} />
            <InputField label="Favicon URL" value={draft.globalSettings.faviconUrl} onChange={(value) => updateGlobal((page) => ({ ...page, faviconUrl: value }))} />
            <InputField label="Primary color" type="color" value={draft.globalSettings.primaryColor} onChange={(value) => updateGlobal((page) => ({ ...page, primaryColor: value }))} />
            <InputField label="Secondary color" type="color" value={draft.globalSettings.secondaryColor} onChange={(value) => updateGlobal((page) => ({ ...page, secondaryColor: value }))} />
            <ToggleField label="Enable dark mode" checked={draft.globalSettings.enableDarkMode} onChange={(value) => updateGlobal((page) => ({ ...page, enableDarkMode: value }))} />
            <ToggleField label="Enable animations" checked={draft.globalSettings.enableAnimations} onChange={(value) => updateGlobal((page) => ({ ...page, enableAnimations: value }))} />
            <ToggleField label="Maintenance mode" checked={draft.globalSettings.maintenanceMode.enabled} onChange={(value) => updateGlobal((page) => ({ ...page, maintenanceMode: { ...page.maintenanceMode, enabled: value } }))} />
            <TextAreaField label="Maintenance message" rows={3} value={draft.globalSettings.maintenanceMode.message} onChange={(value) => updateGlobal((page) => ({ ...page, maintenanceMode: { ...page.maintenanceMode, message: value } }))} />
            <ToggleField label="Announcement banner" checked={draft.globalSettings.announcement.isVisible} onChange={(value) => updateGlobal((page) => ({ ...page, announcement: { ...page.announcement, isVisible: value } }))} />
            <InputField label="Announcement text" value={draft.globalSettings.announcement.text} onChange={(value) => updateGlobal((page) => ({ ...page, announcement: { ...page.announcement, text: value } }))} />
            <InputField label="Announcement link" value={draft.globalSettings.announcement.link} onChange={(value) => updateGlobal((page) => ({ ...page, announcement: { ...page.announcement, link: value } }))} />
            {uploadButton({ label: 'Upload logo', onPick: (file) => uploadImage(file, (url) => updateGlobal((page) => ({ ...page, logoUrl: url }))) })}
            {uploadButton({ label: 'Upload favicon', onPick: (file) => uploadImage(file, (url) => updateGlobal((page) => ({ ...page, faviconUrl: url }))) })}
          </div>
        </article>
      ) : null}

      <article className="admin-card hidden p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">Version History</h3>
          <span className="text-xs text-slate-500">{history.length} publish snapshots</span>
        </div>
        {history.length ? (
          <div className="mt-4 space-y-2">
            {history.slice(0, 8).map((entry) => (
              <div key={entry.version} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Version {entry.version}</span> - {asDateLabel(entry.published_at)}
                </p>
                <button type="button" onClick={() => restoreVersion(entry.version)} className="admin-button-secondary">
                  <FiCopy className="h-4 w-4" aria-hidden="true" />
                  Restore to Draft
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No publish history yet.</p>
        )}
      </article>

      <ConfirmModal
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={publish}
        title="Publish Site Content"
        message="Publish the current draft and make it live on the public website?"
        confirmText="Publish"
      />

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetDraft}
        title="Reset Draft"
        message="Discard draft changes and reset to the latest published version?"
        confirmText="Reset"
        variant="danger"
      />

      <Toast message={toast.message} type={toast.type} />

      {(saving || publishing || uploading || heroSaving) ? <LoadingOverlay message="Processing content changes..." /> : null}
    </div>
  )
}
