import { useEffect, useMemo, useRef, useState } from 'react'
import { FiEdit2, FiImage, FiPlus, FiRefreshCcw, FiSave, FiTrash } from 'react-icons/fi'
import usePageMeta from '../../hooks/usePageMeta.js'
import { extraContent as fallbackExtraContent } from '../../data/siteContent.js'
import {
  fetchFaculty,
  fetchSiteContent,
  saveSiteContent,
  upsertFaculty,
  deleteFaculty,
  cacheFaculty,
  readFacultyCache,
} from '../../services/siteInfoService.js'
import { uploadImageToCloudinary } from '../../lib/cloudinary.js'

const emptyFaculty = { id: null, name: '', role: '', photo: '', sort_order: null }
const PAGE_SIZE = 5

function sortFaculty(list = []) {
  return [...list].sort((a, b) => {
    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

function paginate(list = [], page = 1, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil((list.length || 0) / size))
  const current = Math.min(Math.max(page, 1), totalPages)
  const start = (current - 1) * size
  const end = start + size
  return { items: list.slice(start, end), page: current, totalPages }
}

export default function AdminSiteContent() {
  usePageMeta({ title: 'Site Content' })

  const [content, setContent] = useState({
    vision: '',
    mission: '',
    history: '',
    contact_email: '',
    contact_phone: '',
    extra_content: { ...fallbackExtraContent },
  })
  const [faculty, setFaculty] = useState(() => readFacultyCache() || [])
  const [loading, setLoading] = useState(true)
  const [savingContent, setSavingContent] = useState(false)
  const [savingFaculty, setSavingFaculty] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [facultyImageFile, setFacultyImageFile] = useState(null)
  const [error, setError] = useState('')
  const [facultyForm, setFacultyForm] = useState(emptyFaculty)
  const [lastSection, setLastSection] = useState(() => localStorage.getItem('adminSiteContentLastSection') || '')
  const [facultyPage, setFacultyPage] = useState(1)
  const [programPage, setProgramPage] = useState(1)
  const [facilityPage, setFacilityPage] = useState(1)
  const [admissionsStepPage, setAdmissionsStepPage] = useState(1)
  const [admissionsFormPage, setAdmissionsFormPage] = useState(1)

  const missionRef = useRef(null)
  const contactRef = useRef(null)
  const facultyRef = useRef(null)
  const fileInputRef = useRef(null)

  const isEditing = useMemo(() => Boolean(facultyForm.id), [facultyForm.id])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [{ data: siteContent }, { data: people }] = await Promise.all([fetchSiteContent(), fetchFaculty()])
        if (!mounted) return
        setContent(
          siteContent || {
            vision: '',
            mission: '',
            history: '',
            contact_email: '',
            contact_phone: '',
            extra_content: { ...fallbackExtraContent },
          }
        )
        const sorted = sortFaculty(people || [])
        setFaculty(sorted)
        cacheFaculty(sorted)
        setFacultyPage(1)
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Failed to load content')
      } finally {
        if (mounted) setLoading(false)
      }
      const targetId = lastSection || (window.location.hash ? window.location.hash.replace('#', '') : '')
      if (targetId) {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function handleSaveContent(e) {
    if (e?.preventDefault) e.preventDefault()
    setError('')
    setSavingContent(true)
    try {
      const { data } = await saveSiteContent(content)
      setContent(data)
      const refreshed = await fetchSiteContent()
      if (refreshed?.data) setContent(refreshed.data)
    } catch (err) {
      setError(err.message || 'Failed to save content')
    } finally {
      setSavingContent(false)
    }
  }

  function startEdit(member) {
    setFacultyForm({
      id: member.id,
      name: member.name || '',
      role: member.role || '',
      photo: member.photo || '',
      sort_order: member.sort_order ?? null,
    })
  }

  function resetFacultyForm() {
    setFacultyForm(emptyFaculty)
    setFacultyImageFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSaveFaculty(e) {
    e.preventDefault()
    setError('')
    setSavingFaculty(true)
    try {
      let photoUrl = facultyForm.photo?.trim() || ''
      if (facultyImageFile) {
        setUploading(true)
        const result = await uploadImageToCloudinary(facultyImageFile, {
          folder: 'faculty',
          onProgress: setUploadProgress,
        })
        photoUrl = result.secureUrl
      }

      const { data } = await upsertFaculty({ ...facultyForm, photo: photoUrl })
      setFaculty((prev) => {
        const merged = sortFaculty([data, ...prev.filter((m) => m.id !== data.id)])
        cacheFaculty(merged)
        return merged
      })

      const refreshed = await fetchFaculty()
      if (refreshed?.data) {
        setFaculty(() => {
          const sorted = sortFaculty(refreshed.data)
          cacheFaculty(sorted)
          setFacultyPage(1)
          return sorted
        })
      }
      resetFacultyForm()
    } catch (err) {
      setError(err.message || 'Failed to save faculty')
    } finally {
      setSavingFaculty(false)
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFacultyImageFile(null)
    }
  }

  async function handleDeleteFaculty(id) {
    setError('')
    try {
      await deleteFaculty(id)
      setFaculty((prev) => {
        const remaining = prev.filter((m) => m.id !== id)
        cacheFaculty(remaining)
        setFacultyPage(1)
        return remaining
      })
      if (facultyForm.id === id) resetFacultyForm()
    } catch (err) {
      setError(err.message || 'Failed to delete faculty')
    }
  }

  async function handleUploadClick() {
    if (!fileInputRef.current) return
    setError('')
    fileInputRef.current.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFacultyImageFile(file)
    setUploadProgress(0)
  }

  function rememberSection(id) {
    setLastSection(id)
    localStorage.setItem('adminSiteContentLastSection', id)
    window.location.hash = id
  }

  function updateExtra(updater) {
    setContent((prev) => {
      const currentExtra = prev.extra_content || { ...fallbackExtraContent }
      const nextExtra = updater(currentExtra)
      return { ...prev, extra_content: nextExtra }
    })
    // Reset pagination to first page when lists change to keep UX predictable.
    setProgramPage(1)
    setFacilityPage(1)
    setAdmissionsStepPage(1)
    setAdmissionsFormPage(1)
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 animate-pulse dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
        Loading site content…
      </div>
    )
  }

  const extra = content.extra_content || { ...fallbackExtraContent }
  const facultyPageData = paginate(faculty, facultyPage)
  const programPageData = paginate(extra.programs || [], programPage)
  const facilityPageData = paginate(extra.facilities || [], facilityPage)
  const admissionsStepPageData = paginate(extra.admissions_steps || [], admissionsStepPage)
  const admissionsFormPageData = paginate(extra.admissions_forms || [], admissionsFormPage)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-black text-brand-goldText">Site Content</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Update mission/vision plus faculty & staff in one place. Changes save to Supabase.
        </p>
        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      </div>

      <section
        id="mission-vision"
        ref={missionRef}
        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        onFocusCapture={() => rememberSection('mission-vision')}
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-brand-goldText">Mission & Vision</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Edit core statements displayed on About page.</p>
          </div>
        </header>
        <form className="mt-4 space-y-4" onSubmit={handleSaveContent}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Vision</label>
            <textarea
              value={content.vision}
              onChange={(e) => setContent((prev) => ({ ...prev, vision: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mission</label>
            <textarea
              value={content.mission}
              onChange={(e) => setContent((prev) => ({ ...prev, mission: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">School History (short)</label>
            <textarea
              value={content.history}
              onChange={(e) => setContent((prev) => ({ ...prev, history: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={savingContent}
              className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60"
            >
              <FiSave className="h-4 w-4" aria-hidden="true" />
              {savingContent ? 'Saving…' : 'Save content'}
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true)
                setError('')
                try {
                  const { data } = await fetchSiteContent()
                  setContent(data || { vision: '', mission: '', history: '', contact_email: '', contact_phone: '' })
                } catch (err) {
                  setError(err.message || 'Failed to refresh content')
                } finally {
                  setLoading(false)
                }
              }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
            >
              <FiRefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          </div>
        </form>
      </section>

      <section
        id="school-contact"
        ref={contactRef}
        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        onFocusCapture={() => rememberSection('school-contact')}
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-brand-goldText">School Contact</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Email and phone shown on Contact and footer.</p>
          </div>
        </header>
        <form className="mt-4 space-y-4" onSubmit={handleSaveContent}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contact Email</label>
              <input
                type="email"
                value={content.contact_email}
                onChange={(e) => setContent((prev) => ({ ...prev, contact_email: e.target.value }))}
                placeholder="info@dmsb.example"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contact Phone</label>
              <input
                type="tel"
                value={content.contact_phone}
                onChange={(e) => setContent((prev) => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+63 000 000 0000"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={savingContent}
              className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60"
            >
              <FiSave className="h-4 w-4" aria-hidden="true" />
              {savingContent ? 'Saving…' : 'Save contact'}
            </button>
          </div>
        </form>
      </section>

      <section
        id="site-sections"
        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        onFocusCapture={() => rememberSection('site-sections')}
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-brand-goldText">About & Academics</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Edit homepage About text, values, programs, and facilities.</p>
          </div>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">About Us Intro</label>
            <textarea
              value={extra.about_intro || ''}
              onChange={(e) => updateExtra((ex) => ({ ...ex, about_intro: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Principal’s Message</label>
            <textarea
              value={extra.principal_message || ''}
              onChange={(e) => updateExtra((ex) => ({ ...ex, principal_message: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Core Values (one per line)</label>
            <textarea
              value={(extra.core_values || []).join('\n')}
              onChange={(e) =>
                updateExtra((ex) => ({ ...ex, core_values: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Curriculum Overview (one per line)</label>
            <textarea
              value={(extra.curriculum_overview || []).join('\n')}
              onChange={(e) =>
                updateExtra((ex) => ({
                  ...ex,
                  curriculum_overview: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean),
                }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Programs Offered</label>
              <button
                type="button"
                onClick={() => updateExtra((ex) => ({ ...ex, programs: [...(ex.programs || []), { title: '', description: '' }] }))}
                className="text-xs font-semibold text-brand-blue hover:text-brand-goldText"
              >
                Add program
              </button>
            </div>
            <div className="space-y-3">
              {programPageData.items.map((p, idx) => {
                const globalIdx = (programPageData.page - 1) * PAGE_SIZE + idx
                return (
                  <div key={globalIdx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <input
                    type="text"
                    value={p.title || ''}
                    placeholder="Title"
                    onChange={(e) =>
                      updateExtra((ex) => {
                        const items = [...(ex.programs || [])]
                          items[globalIdx] = { ...items[globalIdx], title: e.target.value }
                        return { ...ex, programs: items }
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <textarea
                    value={p.description || ''}
                    placeholder="Description"
                    onChange={(e) =>
                      updateExtra((ex) => {
                        const items = [...(ex.programs || [])]
                          items[globalIdx] = { ...items[globalIdx], description: e.target.value }
                        return { ...ex, programs: items }
                      })
                    }
                    rows={2}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateExtra((ex) => {
                          const items = [...(ex.programs || [])]
                          items.splice(globalIdx, 1)
                          return { ...ex, programs: items }
                        })
                      }
                      className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                  </div>
                )
              })}
              {extra.programs?.length > PAGE_SIZE ? (
                <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <button
                    type="button"
                    disabled={programPage <= 1}
                    onClick={() => setProgramPage((p) => Math.max(1, p - 1))}
                    className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <span>
                    Page {programPageData.page} of {programPageData.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={programPage >= programPageData.totalPages}
                    onClick={() => setProgramPage((p) => Math.min(programPageData.totalPages, p + 1))}
                    className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Facilities & Labs</label>
              <button
                type="button"
                onClick={() => updateExtra((ex) => ({ ...ex, facilities: [...(ex.facilities || []), { title: '', description: '' }] }))}
                className="text-xs font-semibold text-brand-blue hover:text-brand-goldText"
              >
                Add facility
              </button>
            </div>
            <div className="space-y-3">
              {facilityPageData.items.map((f, idx) => {
                const globalIdx = (facilityPageData.page - 1) * PAGE_SIZE + idx
                return (
                  <div key={globalIdx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <input
                    type="text"
                    value={f.title || ''}
                    placeholder="Title"
                    onChange={(e) =>
                      updateExtra((ex) => {
                        const items = [...(ex.facilities || [])]
                          items[globalIdx] = { ...items[globalIdx], title: e.target.value }
                        return { ...ex, facilities: items }
                      })
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <textarea
                    value={f.description || ''}
                    placeholder="Description"
                    onChange={(e) =>
                      updateExtra((ex) => {
                        const items = [...(ex.facilities || [])]
                          items[globalIdx] = { ...items[globalIdx], description: e.target.value }
                        return { ...ex, facilities: items }
                      })
                    }
                    rows={2}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateExtra((ex) => {
                          const items = [...(ex.facilities || [])]
                          items.splice(globalIdx, 1)
                          return { ...ex, facilities: items }
                        })
                      }
                      className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                  </div>
                )
              })}
              {extra.facilities?.length > PAGE_SIZE ? (
                <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <button
                    type="button"
                    disabled={facilityPage <= 1}
                    onClick={() => setFacilityPage((p) => Math.max(1, p - 1))}
                    className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <span>
                    Page {facilityPageData.page} of {facilityPageData.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={facilityPage >= facilityPageData.totalPages}
                    onClick={() => setFacilityPage((p) => Math.min(facilityPageData.totalPages, p + 1))}
                    className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admissions Content</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">Process steps, requirements, and downloadable forms.</p>
            </div>
            <button
              type="submit"
              form="content-form"
              className="hidden"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admission Steps</label>
                <button
                  type="button"
                  onClick={() =>
                    updateExtra((ex) => ({
                      ...ex,
                      admissions_steps: [...(ex.admissions_steps || []), { title: '', description: '' }],
                    }))
                  }
                  className="text-xs font-semibold text-brand-blue hover:text-brand-goldText"
                >
                  Add step
                </button>
              </div>
              <div className="space-y-3">
                {admissionsStepPageData.items.map((s, idx) => {
                  const globalIdx = (admissionsStepPageData.page - 1) * PAGE_SIZE + idx
                  return (
                    <div key={globalIdx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <input
                      type="text"
                      value={s.title || ''}
                      placeholder="Step title"
                      onChange={(e) =>
                        updateExtra((ex) => {
                          const items = [...(ex.admissions_steps || [])]
                          items[globalIdx] = { ...items[globalIdx], title: e.target.value }
                          return { ...ex, admissions_steps: items }
                        })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <textarea
                      value={s.description || ''}
                      placeholder="Description"
                      onChange={(e) =>
                        updateExtra((ex) => {
                          const items = [...(ex.admissions_steps || [])]
                          items[globalIdx] = { ...items[globalIdx], description: e.target.value }
                          return { ...ex, admissions_steps: items }
                        })
                      }
                      rows={2}
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          updateExtra((ex) => {
                            const items = [...(ex.admissions_steps || [])]
                            items.splice(globalIdx, 1)
                            return { ...ex, admissions_steps: items }
                          })
                        }
                        className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
                {extra.admissions_steps?.length > PAGE_SIZE ? (
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-slate-300">
                    <button
                      type="button"
                      disabled={admissionsStepPage <= 1}
                      onClick={() => setAdmissionsStepPage((p) => Math.max(1, p - 1))}
                      className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                    >
                      Previous
                    </button>
                    <span>
                      Page {admissionsStepPageData.page} of {admissionsStepPageData.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={admissionsStepPage >= admissionsStepPageData.totalPages}
                      onClick={() => setAdmissionsStepPage((p) => Math.min(admissionsStepPageData.totalPages, p + 1))}
                      className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Requirements (one per line)</label>
              <textarea
                value={(extra.admissions_requirements || []).join('\n')}
                onChange={(e) =>
                  updateExtra((ex) => ({
                    ...ex,
                    admissions_requirements: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean),
                  }))
                }
                rows={6}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Downloadable Forms</label>
              <button
                type="button"
                onClick={() => updateExtra((ex) => ({ ...ex, admissions_forms: [...(ex.admissions_forms || []), { label: '', url: '' }] }))}
                className="text-xs font-semibold text-brand-blue hover:text-brand-goldText"
              >
                Add form
              </button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {admissionsFormPageData.items.map((form, idx) => {
                const globalIdx = (admissionsFormPageData.page - 1) * PAGE_SIZE + idx
                return (
                  <div key={globalIdx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    <input
                      type="text"
                      value={form.label || ''}
                      placeholder="Label"
                      onChange={(e) =>
                        updateExtra((ex) => {
                          const items = [...(ex.admissions_forms || [])]
                          items[globalIdx] = { ...items[globalIdx], label: e.target.value }
                          return { ...ex, admissions_forms: items }
                        })
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="url"
                      value={form.url || ''}
                      placeholder="https://..."
                      onChange={(e) =>
                        updateExtra((ex) => {
                          const items = [...(ex.admissions_forms || [])]
                          items[globalIdx] = { ...items[globalIdx], url: e.target.value }
                          return { ...ex, admissions_forms: items }
                        })
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          updateExtra((ex) => {
                            const items = [...(ex.admissions_forms || [])]
                            items.splice(globalIdx, 1)
                            return { ...ex, admissions_forms: items }
                          })
                        }
                        className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {extra.admissions_forms?.length > PAGE_SIZE ? (
              <div className="flex items-center justify-between pt-1 text-xs text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  disabled={admissionsFormPage <= 1}
                  onClick={() => setAdmissionsFormPage((p) => Math.max(1, p - 1))}
                  className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <span>
                  Page {admissionsFormPageData.page} of {admissionsFormPageData.totalPages}
                </span>
                <button
                  type="button"
                  disabled={admissionsFormPage >= admissionsFormPageData.totalPages}
                  onClick={() => setAdmissionsFormPage((p) => Math.min(admissionsFormPageData.totalPages, p + 1))}
                  className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveContent}
            disabled={savingContent}
            className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60"
          >
            <FiSave className="h-4 w-4" aria-hidden="true" />
            {savingContent ? 'Saving…' : 'Save site content'}
          </button>
        </div>
      </section>

      <section
        id="faculty-staff"
        ref={facultyRef}
        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
        onFocusCapture={() => rememberSection('faculty-staff')}
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-brand-goldText">Faculty & Staff</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Names, roles, and photo URLs used on About page.</p>
          </div>
        </header>

        <form className="mt-4 space-y-3" onSubmit={handleSaveFaculty}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Name</label>
              <input
                type="text"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Role / Department</label>
              <input
                type="text"
                value={facultyForm.role}
                onChange={(e) => setFacultyForm((prev) => ({ ...prev, role: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Photo URL</label>
              <input
                type="url"
                value={facultyForm.photo}
                onChange={(e) => setFacultyForm((prev) => ({ ...prev, photo: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  <FiImage className="h-4 w-4" aria-hidden="true" />
                  Choose image
                </button>
                {facultyImageFile ? (
                  <span className="text-xs text-slate-500">{facultyImageFile.name}</span>
                ) : null}
                {uploading ? <span className="text-xs text-slate-500">Uploading… {uploadProgress}%</span> : null}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Order (optional)</label>
              <input
                type="number"
                value={facultyForm.sort_order ?? ''}
                onChange={(e) =>
                  setFacultyForm((prev) => ({ ...prev, sort_order: e.target.value ? Number(e.target.value) : null }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={savingFaculty}
              className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-none ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {isEditing ? <FiEdit2 className="h-4 w-4" aria-hidden="true" /> : <FiPlus className="h-4 w-4" aria-hidden="true" />}
              {savingFaculty ? 'Saving…' : isEditing ? 'Update member' : 'Add member'}
            </button>
            {isEditing ? (
              <button
                type="button"
                onClick={resetFacultyForm}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
          {faculty.length === 0 ? (
            <p className="py-2 text-sm text-slate-600 dark:text-slate-300">No faculty yet. Add your first member.</p>
          ) : (
            facultyPageData.items.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-sky text-sm font-bold text-brand-goldText ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                      {member.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(member)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                  >
                    <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaculty(member.id)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:-translate-y-[1px] hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:text-rose-300 dark:ring-rose-900/50 dark:hover:bg-rose-950/30"
                  >
                    <FiTrash className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
            {faculty.length > PAGE_SIZE ? (
            <div className="flex items-center justify-between pt-3 text-xs text-slate-600 dark:text-slate-300">
              <button
                type="button"
                disabled={facultyPage <= 1}
                onClick={() => setFacultyPage((p) => Math.max(1, p - 1))}
                className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span>
                  Page {facultyPageData.page} of {facultyPageData.totalPages}
              </span>
              <button
                type="button"
                  disabled={facultyPage >= facultyPageData.totalPages}
                  onClick={() => setFacultyPage((p) => Math.min(facultyPageData.totalPages, p + 1))}
                className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
