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
import { deleteFaculty, fetchFaculty, upsertFaculty } from '../../services/siteInfoService.js'
import { uploadFileToSupabase, uploadImageToSupabase } from '../../lib/supabaseStorage.js'
import { createId } from '../../data/siteManagementDefaults.js'

const SECTIONS = [
  { key: 'homepage', label: 'Homepage' },
  { key: 'about', label: 'About Page' },
  { key: 'academics', label: 'Academics Page' },
  { key: 'admissions', label: 'Admissions Page' },
  { key: 'events', label: 'Events Page Settings' },
  { key: 'gallery', label: 'Gallery Page Settings' },
  { key: 'contact', label: 'Contact Page' },
  { key: 'footer', label: 'Footer Content' },
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
const EMPTY_FACULTY_FORM = { id: null, name: '', role: '', photo: '', sort_order: null }
const LOCKED_DEVELOPER_CREDIT = 'Developed by Javy M. Rodillon'

function sortFacultyList(list = []) {
  return [...list].sort((a, b) => {
    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

function applyLockedAdminFields(payload) {
  if (!payload) return payload
  return {
    ...payload,
    footer: {
      ...(payload.footer || {}),
      showDeveloperCredit: true,
      developerCredit: LOCKED_DEVELOPER_CREDIT,
    },
  }
}

function asDateLabel(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="flex-1">
        <span className="block text-sm font-semibold text-slate-700">{label}</span>
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-goldText focus:ring-brand-goldText"
      />
    </label>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', helperText = '' }) {
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
      {helperText ? <span className="mt-1 block text-sm text-slate-500">{helperText}</span> : null}
    </label>
  )
}

function TextAreaField({ label, value, onChange, rows = 4, placeholder = '', helperText = '' }) {
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
      {helperText ? <span className="mt-1 block text-sm text-slate-500">{helperText}</span> : null}
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
  const [faculty, setFaculty] = useState([])
  const [facultyLoading, setFacultyLoading] = useState(true)
  const [facultySaving, setFacultySaving] = useState(false)
  const [facultyForm, setFacultyForm] = useState(EMPTY_FACULTY_FORM)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await fetchSiteManagement()
        if (!alive) return
        setDraft(applyLockedAdminFields(data.draft))
        setPublished(applyLockedAdminFields(data.published))
        setMeta(data.meta)
        setHistory(data.history || [])
      } catch (loadError) {
        if (!alive) return
        setError(loadError.message || 'We could not load the website content settings. Please refresh and try again.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await fetchFaculty()
        if (!alive) return
        setFaculty(sortFacultyList(data || []))
      } catch (loadError) {
        if (!alive) return
        setFailure(loadError.message || 'We could not load the staff list. Please refresh and try again.')
      } finally {
        if (alive) setFacultyLoading(false)
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
    setDraft((prev) => applyLockedAdminFields(updater(prev)))
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
      setSuccess('Image uploaded successfully.')
    } catch (uploadError) {
      setError(uploadError.message || 'We could not upload the image. Please try again.')
      setFailure(uploadError.message || 'We could not upload the image. Please try again.')
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
      setSuccess('File uploaded successfully.')
    } catch (uploadError) {
      setError(uploadError.message || 'We could not upload the file. Please try again.')
      setFailure(uploadError.message || 'We could not upload the file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function saveDraft() {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      const lockedDraft = applyLockedAdminFields(draft)
      const { data } = await saveSiteManagementDraft(lockedDraft)
      setDraft(applyLockedAdminFields(data.draft))
      setPublished(applyLockedAdminFields(data.published))
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(false)
      setSuccess('Draft changes saved.')
    } catch (saveError) {
      setError(saveError.message || 'We could not save your draft changes. Please try again.')
      setFailure(saveError.message || 'We could not save your draft changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    if (!draft) return
    setPublishing(true)
    setError('')
    try {
      const lockedDraft = applyLockedAdminFields(draft)
      const { data } = await publishSiteManagement(lockedDraft, publishNote)
      setDraft(applyLockedAdminFields(data.draft))
      setPublished(applyLockedAdminFields(data.published))
      setMeta(data.meta)
      setHistory(data.history || [])
      setPublishNote('')
      setDirty(false)
      setSuccess(`Changes published to the website${data.meta?.version ? ` as version ${data.meta.version}` : ''}.`)
    } catch (publishError) {
      setError(publishError.message || 'We could not publish your changes. Your draft is still saved.')
      setFailure(publishError.message || 'We could not publish your changes. Your draft is still saved.')
    } finally {
      setPublishing(false)
    }
  }

  async function saveAndPublishHero() {
    if (!draft) return
    setHeroSaving(true)
    setError('')
    try {
      const lockedDraft = applyLockedAdminFields(draft)
      const { data } = await publishSiteManagement(lockedDraft, 'Homepage banner updated')
      setDraft(applyLockedAdminFields(data.draft))
      setPublished(applyLockedAdminFields(data.published))
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(false)
      setSuccess('Homepage banner changes are now live on the website.')
    } catch (heroError) {
      setError(heroError.message || 'We could not publish the homepage banner changes. Your draft is still saved.')
      setFailure(heroError.message || 'We could not publish the homepage banner changes. Your draft is still saved.')
    } finally {
      setHeroSaving(false)
    }
  }

  async function resetDraft() {
    setSaving(true)
    setError('')
    try {
      const { data } = await resetSiteManagementDraftToPublished()
      setDraft(applyLockedAdminFields(data.draft))
      setPublished(applyLockedAdminFields(data.published))
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(false)
      setSuccess('Draft reset to the latest published version.')
    } catch (resetError) {
      setError(resetError.message || 'We could not reset the draft. Please try again.')
      setFailure(resetError.message || 'We could not reset the draft. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function restoreVersion(version) {
    setSaving(true)
    setError('')
    try {
      const { data } = await restoreSiteManagementVersion(version)
      setDraft(applyLockedAdminFields(data.draft))
      setPublished(applyLockedAdminFields(data.published))
      setMeta(data.meta)
      setHistory(data.history || [])
      setDirty(true)
      setSuccess(`Version ${version} has been restored to the draft for review.`)
    } catch (restoreError) {
      setError(restoreError.message || 'We could not restore that version. Please try again.')
      setFailure(restoreError.message || 'We could not restore that version. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !draft || !published || !meta) {
    return <LoadingOverlay message="Loading website content settings..." />
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

  function duplicateIn(list, index, prefix) {
    const next = [...list]
    next.splice(index + 1, 0, duplicateSectionItem(list[index], prefix))
    return next
  }

  function resetFacultyForm() {
    setFacultyForm(EMPTY_FACULTY_FORM)
  }

  function startEditFaculty(member) {
    setFacultyForm({
      id: member.id,
      name: member.name || '',
      role: member.role || '',
      photo: member.photo || '',
      sort_order: Number.isFinite(member.sort_order) ? member.sort_order : member.sort_order ?? null,
    })
  }

  async function uploadFacultyPhoto(file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadImageToSupabase(file, { bucket: 'faculty' })
      setFacultyForm((prev) => ({ ...prev, photo: result.publicUrl }))
      setSuccess('Staff photo uploaded successfully.')
    } catch (uploadError) {
      setError(uploadError.message || 'We could not upload the staff photo. Please try again.')
      setFailure(uploadError.message || 'We could not upload the staff photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function saveFacultyMember() {
    if (!facultyForm.name?.trim() || !facultyForm.role?.trim()) {
      setFailure("Enter both the staff member's name and position before saving.")
      return
    }
    setFacultySaving(true)
    setError('')
    try {
      const { data } = await upsertFaculty({
        ...facultyForm,
        name: facultyForm.name,
        role: facultyForm.role,
      })
      setFaculty((prev) => sortFacultyList([data, ...prev.filter((item) => item.id !== data.id)]))
      resetFacultyForm()
      setSuccess('Staff profile saved.')
    } catch (saveError) {
      setError(saveError.message || 'We could not save this staff profile. Please try again.')
      setFailure(saveError.message || 'We could not save this staff profile. Please try again.')
    } finally {
      setFacultySaving(false)
    }
  }

  async function removeFacultyMember(id) {
    if (!window.confirm('Delete this staff profile from the About page?')) return
    setFacultySaving(true)
    setError('')
    try {
      await deleteFaculty(id)
      setFaculty((prev) => prev.filter((item) => item.id !== id))
      if (facultyForm.id === id) resetFacultyForm()
      setSuccess('Staff profile deleted.')
    } catch (deleteError) {
      setError(deleteError.message || 'We could not delete this staff profile. Please try again.')
      setFailure(deleteError.message || 'We could not delete this staff profile. Please try again.')
    } finally {
      setFacultySaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Site Management"
        description="Update the text, images, buttons, and visibility settings for each public website page before publishing changes."
        actions={
          <>
            <button type="button" onClick={() => setConfirmReset(true)} className="admin-button-secondary" disabled={!dirty || saving || publishing}>
              <FiRefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset draft to last published version
            </button>
            <button type="button" onClick={saveDraft} className="admin-button-secondary" disabled={saving || publishing}>
              <FiSave className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving draft changes...' : 'Save changes as draft'}
            </button>
            <button type="button" onClick={() => setConfirmPublish(true)} className="admin-button-primary" disabled={saving || publishing}>
              <FiSend className="h-4 w-4" aria-hidden="true" />
              {publishing ? 'Publishing changes...' : 'Publish changes to website'}
            </button>
          </>
        }
      />

      <article className="admin-card p-4">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="inline-flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold">
              <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
              Draft version {meta.version || 1}
            </span>
            <span>Last draft save: {asDateLabel(meta.last_saved_at)}</span>
            <span>Last website update: {asDateLabel(meta.last_published_at)}</span>
            {dirty ? (
              <span className="font-semibold text-amber-700">You have unpublished changes</span>
            ) : (
              <span className="font-semibold text-emerald-700">All draft changes are saved</span>
            )}
          </div>
          <InputField
            label="Update summary"
            value={publishNote}
            onChange={setPublishNote}
            placeholder="Example: Updated admissions requirements and office hours."
            helperText="Optional. This note helps staff remember what changed in this published version."
          />
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
            <h2 className="text-base font-semibold text-slate-900">Homepage Banner</h2>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              <div className="space-y-3">
                <InputField
                  label="Main banner headline"
                  value={draft.homepage.hero.title}
                  onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, title: value } }))}
                  placeholder="Example: Faith-based learning that helps every child grow"
                />
                <TextAreaField
                  label="Main banner supporting text"
                  value={draft.homepage.hero.subtitle}
                  rows={4}
                  onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, subtitle: value } }))}
                  placeholder="Write a short welcome message for families visiting the homepage."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField
                    label="Main button text"
                    value={draft.homepage.hero.ctaPrimaryText}
                    onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, ctaPrimaryText: value } }))}
                    placeholder="Example: Start Enrollment"
                  />
                  <InputField
                    label="Secondary button text"
                    value={draft.homepage.hero.ctaSecondaryText}
                    onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, ctaSecondaryText: value } }))}
                    placeholder="Example: Learn More"
                  />
                </div>
                {uploadButton({
                  label: 'Upload banner background image',
                  onPick: (file) => uploadImage(file, (url) => updateHome((home) => ({ ...home, hero: { ...home.hero, backgroundImage: url } }))),
                })}
                <InputField
                  label="Small highlight heading"
                  value={draft.homepage.hero.focusLabel}
                  onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, focusLabel: value } }))}
                  placeholder="Example: Why families choose us"
                />
                <TextAreaField
                  label="Small highlight description"
                  rows={3}
                  value={draft.homepage.hero.focusText}
                  onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, focusText: value } }))}
                  placeholder="Add one short message that supports the main banner."
                />
                {uploadButton({
                  label: 'Upload highlight image',
                  onPick: (file) => uploadImage(file, (url) => updateHome((home) => ({ ...home, hero: { ...home.hero, focusImage: url } }))),
                })}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-sm text-slate-600">Use this when the homepage banner is ready to go live right away.</p>
                  <button
                    type="button"
                    onClick={saveAndPublishHero}
                    disabled={heroSaving || saving || publishing}
                    className="admin-button-primary"
                  >
                    <FiSave className="h-4 w-4" aria-hidden="true" />
                    {heroSaving ? 'Publishing banner changes...' : 'Publish banner changes now'}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ToggleField label="Show animated number counters" checked={draft.homepage.hero.enableAnimatedCounters} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, enableAnimatedCounters: value } }))} />
                  <ToggleField label="Turn on the scrolling background effect" checked={draft.homepage.hero.enableParallax} onChange={(value) => updateHome((home) => ({ ...home, hero: { ...home.hero, enableParallax: value } }))} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Preview of homepage banner</p>
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-red-700 to-rose-600 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">{draft.globalSettings.schoolName}</p>
                  <h3 className="mt-2 text-2xl font-extrabold">{draft.homepage.hero.title}</h3>
                  <p className="mt-2 text-sm text-white/85">{draft.homepage.hero.subtitle}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {visibleHeroStats.map((item) => (
                      <div key={item.id} className="rounded-xl bg-white/15 p-3 text-center ring-1 ring-white/20">
                        <p className="text-lg font-black">{item.value || '--'}</p>
                        <p className="text-[11px] font-semibold uppercase">{item.label || 'Highlight'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SortableCardsEditor
              title="Homepage statistic cards"
              description="Add short number highlights that appear on the homepage banner."
              items={draft.homepage.hero.statCards}
              addLabel="Add stat card"
              itemName="Stat card"
              itemLabel={(item, index) => item.label?.trim() || `Stat card ${index + 1}`}
              onAdd={() => updateHome((home) => ({ ...home, hero: { ...home.hero, statCards: [...home.hero.statCards, { id: createId('hero-stat'), label: '', value: '', icon: '', isVisible: true }] } }))}
              onChange={(items) => updateHome((home) => ({ ...home, hero: { ...home.hero, statCards: items } }))}
              onDuplicate={(_, index) => updateHome((home) => ({ ...home, hero: { ...home.hero, statCards: duplicateIn(home.hero.statCards, index, 'hero-stat') } }))}
              renderBody={({ item, updateItem }) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField
                    label="Stat label"
                    value={item.label}
                    onChange={(value) => updateItem({ label: value })}
                    placeholder="Example: School Departments"
                    helperText="This short text appears below the number."
                  />
                  <InputField
                    label="Number to display"
                    value={item.value}
                    onChange={(value) => updateItem({ value: value })}
                    placeholder="Example: 20+"
                    helperText="Use a number, percentage, or short figure such as 100% or 20+."
                  />
                  <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                </div>
              )}
            />
          </article>

          <SortableCardsEditor
            title="Homepage trust highlights"
            description="Add short trust-building highlights shown near the top of the homepage."
            items={draft.homepage.trustBadges}
            addLabel="Add trust highlight"
            itemName="Trust highlight"
            itemLabel={(item, index) => item.label?.trim() || `Trust highlight ${index + 1}`}
            onAdd={() => updateHome((home) => ({ ...home, trustBadges: [...home.trustBadges, { id: createId('trust'), label: '', icon: '', image: '', isVisible: true }] }))}
            onChange={(items) => updateHome((home) => ({ ...home, trustBadges: items }))}
            onDuplicate={(_, index) => updateHome((home) => ({ ...home, trustBadges: duplicateIn(home.trustBadges, index, 'trust') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Trust highlight text" value={item.label} onChange={(value) => updateItem({ label: value })} placeholder="Example: Safe and supportive campus" />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Homepage content sections"
            description="Add extra content blocks that appear farther down the homepage."
            items={draft.homepage.sections}
            addLabel="Add homepage section"
            itemName="Homepage section"
            itemLabel={(item, index) => item.title?.trim() || `Homepage section ${index + 1}`}
            onAdd={() => updateHome((home) => ({ ...home, sections: [...home.sections, { id: createId('home-section'), type: 'Highlight', title: '', content: '', image: '', ctaText: '', ctaLink: '', isPublished: false }] }))}
            onChange={(items) => updateHome((home) => ({ ...home, sections: items }))}
            onDuplicate={(_, index) => updateHome((home) => ({ ...home, sections: duplicateIn(home.sections, index, 'home-section') }))}
            renderBody={({ item, updateItem }) => (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Section layout</span>
                  <select value={item.type} onChange={(event) => updateItem({ type: event.target.value })} className="admin-input mt-1">
                    {HOME_SECTION_TYPE_OPTIONS.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-sm text-slate-500">Choose how this section should appear on the homepage.</span>
                </label>
                <InputField label="Section heading" value={item.title} onChange={(value) => updateItem({ title: value })} placeholder="Example: Learning with compassion and excellence" />
                <TextAreaField label="Section text" value={item.content} rows={4} onChange={(value) => updateItem({ content: value })} placeholder="Add the text that visitors should read in this section." />
                <ToggleField label="Show this section when you publish changes" checked={item.isPublished !== false} onChange={(value) => updateItem({ isPublished: value })} />
              </div>
            )}
          />

        </div>
      ) : null}

      {activeSection === 'about' ? (
        <div className="space-y-4">
          <article className="admin-card p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">About page content</h2>
            <TextAreaField
              label="Introductory text for the About page"
              rows={3}
              value={draft.aboutPage.intro}
              onChange={(value) => updateAbout((about) => ({ ...about, intro: value }))}
              placeholder="Write a short introduction to the school for website visitors."
            />
            <AdminRichTextEditor
              label="Mission statement"
              value={draft.aboutPage.mission}
              onChange={(value) => updateAbout((about) => ({ ...about, mission: value }))}
              helperText="This text appears on the public About page."
            />
            <AdminRichTextEditor
              label="Vision statement"
              value={draft.aboutPage.vision}
              onChange={(value) => updateAbout((about) => ({ ...about, vision: value }))}
              helperText="This text appears on the public About page."
            />
            <AdminRichTextEditor
              label="Principal's message"
              value={draft.aboutPage.principalMessage}
              onChange={(value) => updateAbout((about) => ({ ...about, principalMessage: value }))}
              helperText="Use this area for a welcome message or leadership note."
            />
            <ToggleField label="Show the leadership and staff section on the website" checked={draft.aboutPage.showFacultySection} onChange={(value) => updateAbout((about) => ({ ...about, showFacultySection: value }))} />
          </article>

          <SortableCardsEditor
            title="School timeline"
            description="Add important school milestones in the order you want them displayed."
            items={draft.aboutPage.timeline}
            addLabel="Add timeline entry"
            itemName="Timeline entry"
            itemLabel={(item, index) => item.year?.trim() || `Timeline entry ${index + 1}`}
            onAdd={() => updateAbout((about) => ({ ...about, timeline: [...about.timeline, { id: createId('about-timeline'), year: '', description: '', isVisible: true }] }))}
            onChange={(items) => updateAbout((about) => ({ ...about, timeline: items }))}
            onDuplicate={(_, index) => updateAbout((about) => ({ ...about, timeline: duplicateIn(about.timeline, index, 'about-timeline') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField label="Year or date" value={item.year} onChange={(value) => updateItem({ year: value })} placeholder="Example: 1998 or June 2005" />
                <TextAreaField label="Timeline description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} placeholder="Describe the milestone visitors should see." />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <article className="admin-card p-5 space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Leadership, Faculty & Staff</h3>
            <p className="text-sm text-slate-500">Manage the members shown on the public About page.</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                label="Staff member name"
                value={facultyForm.name}
                onChange={(value) => setFacultyForm((prev) => ({ ...prev, name: value }))}
                placeholder="Example: Maria Santos"
              />
              <InputField
                label="Position or department"
                value={facultyForm.role}
                onChange={(value) => setFacultyForm((prev) => ({ ...prev, role: value }))}
                placeholder="Example: Principal or Grade 6 Adviser"
              />
              <InputField
                label="Display order (optional)"
                type="number"
                value={facultyForm.sort_order == null ? '' : String(facultyForm.sort_order)}
                onChange={(value) => setFacultyForm((prev) => ({ ...prev, sort_order: value === '' ? null : Number(value) }))}
                helperText="Use a smaller number to show this person earlier in the list."
              />
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Photo upload status</p>
                <p className="mt-1 text-sm text-slate-600">{facultyForm.photo ? 'Photo uploaded' : 'No photo uploaded yet'}</p>
              </div>
            </div>

            {uploadButton({ label: 'Upload staff photo', onPick: uploadFacultyPhoto })}

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={saveFacultyMember} disabled={facultySaving || uploading} className="admin-button-primary">
                <FiSave className="h-4 w-4" aria-hidden="true" />
                {facultySaving ? 'Saving staff profile...' : facultyForm.id ? 'Save staff changes' : 'Add staff member'}
              </button>
              {facultyForm.id ? (
                <button type="button" onClick={resetFacultyForm} className="admin-button-secondary" disabled={facultySaving || uploading}>
                  Cancel editing
                </button>
              ) : null}
            </div>

            {facultyLoading ? (
              <p className="text-sm text-slate-500">Loading staff list...</p>
            ) : faculty.length ? (
              <div className="space-y-2">
                {faculty.map((member) => (
                  <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-3">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name || 'Member'} className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200" loading="lazy" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                          {(member.name || '?').charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.name || 'Unnamed staff member'}</p>
                        <p className="text-xs text-slate-600">{member.role || 'Position not entered'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEditFaculty(member)} className="admin-button-secondary" disabled={facultySaving || uploading}>
                        Edit details
                      </button>
                      <button type="button" onClick={() => removeFacultyMember(member.id)} className="admin-button-danger" disabled={facultySaving || uploading}>
                        Delete profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No staff profiles have been added yet. Complete the form above and select "Add staff member" to create the first one.</p>
            )}
          </article>
        </div>
      ) : null}

      {activeSection === 'academics' ? (
        <div className="space-y-4">
          <SortableCardsEditor
            title="Program tabs"
            description="Add the tabs that visitors can switch between on the Academics page."
            items={draft.academicsPage.programTabs}
            addLabel="Add program tab"
            itemName="Program tab"
            itemLabel={(item, index) => item.title?.trim() || `Program tab ${index + 1}`}
            onAdd={() => updateAcademics((page) => ({ ...page, programTabs: [...page.programTabs, { id: createId('program-tab'), key: '', title: '', description: '', image: '', isVisible: true }] }))}
            onChange={(items) => updateAcademics((page) => ({ ...page, programTabs: items }))}
            onDuplicate={(_, index) => updateAcademics((page) => ({ ...page, programTabs: duplicateIn(page.programTabs, index, 'program-tab') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Short tab name used in links"
                  value={item.key}
                  onChange={(value) => updateItem({ key: value })}
                  placeholder="Example: senior-high-school"
                  helperText="Use lowercase letters, numbers, and hyphens only."
                />
                <InputField label="Program title" value={item.title} onChange={(value) => updateItem({ title: value })} placeholder="Example: Senior High School" />
                <TextAreaField label="Program description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} placeholder="Describe this program for families and students." />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                {uploadButton({ label: 'Upload tab image', onPick: (file) => uploadImage(file, (url) => updateItem({ image: url })) })}
              </div>
            )}
          />

          <SortableCardsEditor
            title="Curriculum information blocks"
            description="Add short sections that explain the curriculum on the Academics page."
            items={draft.academicsPage.curriculumBlocks}
            addLabel="Add curriculum block"
            itemName="Curriculum block"
            itemLabel={(item, index) => item.title?.trim() || `Curriculum block ${index + 1}`}
            onAdd={() => updateAcademics((page) => ({ ...page, curriculumBlocks: [...page.curriculumBlocks, { id: createId('curriculum'), title: '', description: '', isVisible: true }] }))}
            onChange={(items) => updateAcademics((page) => ({ ...page, curriculumBlocks: items }))}
            onDuplicate={(_, index) => updateAcademics((page) => ({ ...page, curriculumBlocks: duplicateIn(page.curriculumBlocks, index, 'curriculum') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Block heading" value={item.title} onChange={(value) => updateItem({ title: value })} placeholder="Example: Values formation" />
                <TextAreaField label="Block description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} placeholder="Explain what this curriculum block covers." />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Facilities, Labs and Learning Spaces"
            description="Manage facility cards shown on the Academics page."
            items={draft.academicsPage.facilitySections}
            addLabel="Add facility card"
            itemName="Facility card"
            itemLabel={(item, index) => item.title?.trim() || `Facility card ${index + 1}`}
            onAdd={() =>
              updateAcademics((page) => ({
                ...page,
                facilitySections: [...page.facilitySections, { id: createId('facility'), title: '', description: '', image: '', isVisible: true }],
              }))
            }
            onChange={(items) => updateAcademics((page) => ({ ...page, facilitySections: items }))}
            onDuplicate={(_, index) => updateAcademics((page) => ({ ...page, facilitySections: duplicateIn(page.facilitySections, index, 'facility') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Facility name" value={item.title} onChange={(value) => updateItem({ title: value })} placeholder="Example: Science Laboratory" />
                <TextAreaField label="Facility description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} placeholder="Explain what students can do or learn in this space." />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Facility photo status</p>
                  <p className="mt-1 text-sm text-slate-600">{item.image ? 'Photo uploaded' : 'No photo uploaded yet'}</p>
                </div>
                {uploadButton({ label: 'Upload facility photo', onPick: (file) => uploadImage(file, (url) => updateItem({ image: url })) })}
              </div>
            )}
          />
        </div>
      ) : null}

      {activeSection === 'admissions' ? (
        <div className="space-y-4">
          <SortableCardsEditor
            title="Admissions process steps"
            description="Add the steps families should follow when applying."
            items={draft.admissionsPage.steps}
            addLabel="Add admissions step"
            itemName="Admissions step"
            itemLabel={(item, index) => item.title?.trim() || `Admissions step ${index + 1}`}
            onAdd={() => updateAdmissions((page) => ({ ...page, steps: [...page.steps, { id: createId('admission-step'), title: '', description: '', isVisible: true }] }))}
            onChange={(items) => updateAdmissions((page) => ({ ...page, steps: items }))}
            onDuplicate={(_, index) => updateAdmissions((page) => ({ ...page, steps: duplicateIn(page.steps, index, 'admission-step') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField label="Step heading" value={item.title} onChange={(value) => updateItem({ title: value })} placeholder="Example: Submit the application form" />
                <TextAreaField label="Step description" rows={3} value={item.description} onChange={(value) => updateItem({ description: value })} placeholder="Explain what the family should do during this step." />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Admissions requirements checklist"
            description="List the documents or items families need to prepare."
            items={draft.admissionsPage.requirements}
            addLabel="Add requirement"
            itemName="Requirement"
            itemLabel={(item, index) => item.value?.trim() || `Requirement ${index + 1}`}
            onAdd={() => updateAdmissions((page) => ({ ...page, requirements: [...page.requirements, { id: createId('admission-requirement'), value: '', isVisible: true }] }))}
            onChange={(items) => updateAdmissions((page) => ({ ...page, requirements: items }))}
            onDuplicate={(_, index) => updateAdmissions((page) => ({ ...page, requirements: duplicateIn(page.requirements, index, 'admission-requirement') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Requirement item"
                  value={item.value}
                  onChange={(value) => updateItem({ value })}
                  placeholder="Example: PSA birth certificate (photocopy)"
                />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <SortableCardsEditor
            title="Downloadable admission forms"
            description="Add forms or files families can download from the Admissions page."
            items={draft.admissionsPage.forms}
            addLabel="Add download"
            itemName="Download"
            itemLabel={(item, index) => item.label?.trim() || `Download ${index + 1}`}
            onAdd={() => updateAdmissions((page) => ({ ...page, forms: [...page.forms, { id: createId('admission-form'), label: '', url: '', isVisible: true }] }))}
            onChange={(items) => updateAdmissions((page) => ({ ...page, forms: items }))}
            onDuplicate={(_, index) => updateAdmissions((page) => ({ ...page, forms: duplicateIn(page.forms, index, 'admission-form') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Form name"
                  value={item.label}
                  onChange={(value) => updateItem({ label: value })}
                  placeholder="Example: Enrollment Form"
                  helperText="This is the name families will see before they download the file."
                />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
                {uploadButton({
                  label: 'Upload downloadable file',
                  accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
                  onPick: (file) => uploadForm(file, (url) => updateItem({ url })),
                })}
              </div>
            )}
          />

          <article className="admin-card p-5 space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Transportation section and call-to-action</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField
                label="Transportation section heading"
                value={draft.admissionsPage.transportation.title}
                onChange={(value) =>
                  updateAdmissions((page) => ({
                    ...page,
                    transportation: { ...page.transportation, title: value },
                  }))
                }
                placeholder="Example: School transportation assistance"
              />
              <TextAreaField
                label="Transportation section description"
                rows={3}
                value={draft.admissionsPage.transportation.subtitle}
                onChange={(value) =>
                  updateAdmissions((page) => ({
                    ...page,
                    transportation: { ...page.transportation, subtitle: value },
                  }))
                }
                placeholder="Explain the transportation service or support offered to families."
              />
              <InputField
                label="Bottom page banner heading"
                value={draft.admissionsPage.cta.title}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, title: value } }))}
                placeholder="Example: Ready to begin enrollment?"
              />
              <TextAreaField
                label="Bottom page banner description"
                rows={3}
                value={draft.admissionsPage.cta.subtitle}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, subtitle: value } }))}
                placeholder="Write the short message that appears above the button."
              />
              <InputField
                label="Button text"
                value={draft.admissionsPage.cta.primaryText}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, primaryText: value } }))}
                placeholder="Example: Contact Admissions"
              />
              <InputField
                label="Button destination link"
                value={draft.admissionsPage.cta.primaryLink}
                onChange={(value) => updateAdmissions((page) => ({ ...page, cta: { ...page.cta, primaryLink: value } }))}
                placeholder="Example: /contact or https://example.com/form"
                helperText="Use a full web address or a website path such as /contact."
              />
            </div>
          </article>
        </div>
      ) : null}

      {activeSection === 'events' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Events page settings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleField label="Show featured event section" checked={draft.eventsSettings.showFeaturedEvent} onChange={(value) => updateEvents((page) => ({ ...page, showFeaturedEvent: value }))} />
            <ToggleField label="Show countdown to the featured event" checked={draft.eventsSettings.enableCountdown} onChange={(value) => updateEvents((page) => ({ ...page, enableCountdown: value }))} />
            <ToggleField label='Show "Add to Calendar" button' checked={draft.eventsSettings.showAddToCalendar} onChange={(value) => updateEvents((page) => ({ ...page, showAddToCalendar: value }))} />
            {uploadButton({ label: 'Upload events banner image', onPick: (file) => uploadImage(file, (url) => updateEvents((page) => ({ ...page, eventBannerImage: url }))) })}
          </div>
        </article>
      ) : null}

      {activeSection === 'gallery' ? (
        <div className="space-y-4">
          <SortableCardsEditor
            title="Gallery categories"
            description="Organize gallery items into categories visitors can browse."
            items={draft.gallerySettings.categories}
            addLabel="Add category"
            itemName="Category"
            itemLabel={(item, index) => item.name?.trim() || `Category ${index + 1}`}
            onAdd={() => updateGallery((page) => ({ ...page, categories: [...page.categories, { id: createId('gallery-category'), name: '', slug: '', isVisible: true }] }))}
            onChange={(items) => updateGallery((page) => ({ ...page, categories: items }))}
            onDuplicate={(_, index) => updateGallery((page) => ({ ...page, categories: duplicateIn(page.categories, index, 'gallery-category') }))}
            renderBody={({ item, updateItem }) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <InputField label="Category name" value={item.name} onChange={(value) => updateItem({ name: value })} placeholder="Example: Campus Life" />
                <InputField
                  label="Short name used in the page link"
                  value={item.slug}
                  onChange={(value) => updateItem({ slug: value })}
                  placeholder="Example: campus-life"
                  helperText="Use lowercase letters, numbers, and hyphens only."
                />
                <ToggleField label="Show on website" checked={item.isVisible !== false} onChange={(value) => updateItem({ isVisible: value })} />
              </div>
            )}
          />

          <article className="admin-card p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Gallery page settings</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField label="Featured gallery heading" value={draft.gallerySettings.featuredGalleryTitle} onChange={(value) => updateGallery((page) => ({ ...page, featuredGalleryTitle: value }))} placeholder="Example: Moments from school life" />
              <TextAreaField label="Featured gallery description" rows={3} value={draft.gallerySettings.featuredGalleryDescription} onChange={(value) => updateGallery((page) => ({ ...page, featuredGalleryDescription: value }))} placeholder="Write the short text that appears above the featured gallery image." />
              <InputField
                label="Featured image web link (optional)"
                value={draft.gallerySettings.featuredImage}
                onChange={(value) => updateGallery((page) => ({ ...page, featuredImage: value }))}
                placeholder="Example: https://example.com/image.jpg"
                helperText="Use this only if the image is already online. Otherwise, upload an image below."
              />
              <InputField label="Default caption for gallery photos" value={draft.gallerySettings.defaultCaption} onChange={(value) => updateGallery((page) => ({ ...page, defaultCaption: value }))} placeholder="Example: Divine Mercy School of Bukidnon, Inc." />
              <ToggleField label="Open photos in a larger pop-up view" checked={draft.gallerySettings.enableLightbox} onChange={(value) => updateGallery((page) => ({ ...page, enableLightbox: value }))} />
              {uploadButton({ label: 'Upload featured gallery image', onPick: (file) => uploadImage(file, (url) => updateGallery((page) => ({ ...page, featuredImage: url }))) })}
            </div>
          </article>
        </div>
      ) : null}

      {activeSection === 'contact' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Contact page details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputField label="School address" value={draft.contactPage.address} onChange={(value) => updateContact((page) => ({ ...page, address: value }))} placeholder="Example: Malaybalay City, Bukidnon" />
            <InputField label="Main contact number" value={draft.contactPage.phone} onChange={(value) => updateContact((page) => ({ ...page, phone: value }))} placeholder="Example: +63 912 345 6789" />
            <InputField label="Public email address" type="email" value={draft.contactPage.email} onChange={(value) => updateContact((page) => ({ ...page, email: value }))} placeholder="Example: admissions@school.edu.ph" />
            <InputField label="Office hours" value={draft.contactPage.officeHours} onChange={(value) => updateContact((page) => ({ ...page, officeHours: value }))} placeholder="Example: Monday to Friday, 8:00 AM to 5:00 PM" />
            <InputField
              label="Facebook Messenger chat link"
              value={draft.contactPage.messengerLink}
              onChange={(value) => updateContact((page) => ({ ...page, messengerLink: value }))}
              placeholder="Example: https://m.me/yourpage"
              helperText="Paste the direct Messenger link used by families to start a chat."
            />
            <InputField
              label="Email address that receives contact form messages"
              type="email"
              value={draft.contactPage.recipientEmail}
              onChange={(value) => updateContact((page) => ({ ...page, recipientEmail: value }))}
              placeholder="Example: registrar@school.edu.ph"
            />
          </div>
        </article>
      ) : null}

      {activeSection === 'footer' ? (
        <article className="admin-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Footer content</h2>
          <TextAreaField label="Footer description text" rows={4} value={draft.footer.description} onChange={(value) => updateFooter((page) => ({ ...page, description: value }))} placeholder="Write the short description that appears in the website footer." />
          <InputField label="Copyright notice" value={draft.footer.copyrightText} onChange={(value) => updateFooter((page) => ({ ...page, copyrightText: value }))} placeholder="Example: Copyright 2026 Divine Mercy School of Bukidnon, Inc." />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            The developer credit is fixed and will always appear in the website footer.
          </div>
        </article>
      ) : null}

      <article className="admin-card hidden p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">Version History</h3>
          <span className="text-xs text-slate-500">{history.length} published versions</span>
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
                  Restore this version to the draft
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No published versions are available yet.</p>
        )}
      </article>

      <ConfirmModal
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={publish}
        title="Publish changes to website"
        message="Publish the current draft and make these changes visible on the website?"
        confirmText="Publish changes"
      />

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetDraft}
        title="Reset draft changes"
        message="Discard unpublished edits and return this draft to the last published version?"
        confirmText="Reset draft"
        variant="danger"
      />

      <Toast message={toast.message} type={toast.type} />

      {(saving || publishing || uploading || heroSaving) ? <LoadingOverlay message="Saving website content..." /> : null}
    </div>
  )
}
