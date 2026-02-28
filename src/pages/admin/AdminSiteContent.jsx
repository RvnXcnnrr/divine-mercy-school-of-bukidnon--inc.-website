import { useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronDown, FiEdit2, FiImage, FiPlus, FiRefreshCcw, FiSave, FiTrash } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import usePageMeta from '../../hooks/usePageMeta.js'
import { extraContent as fallbackExtraContent } from '../../data/siteContent.js'
import LoadingOverlay from '../../components/LoadingOverlay.jsx'
import {
  fetchFaculty,
  fetchSiteContent,
  saveSiteContent,
  upsertFaculty,
  deleteFaculty,
  cacheFaculty,
  readFacultyCache,
} from '../../services/siteInfoService.js'
import { uploadImageToSupabase, uploadFileToSupabase } from '../../lib/supabaseStorage.js'

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
  const [facultyPage, setFacultyPage] = useState(1)
  const [programPage, setProgramPage] = useState(1)
  const [facilityPage, setFacilityPage] = useState(1)
  const [buildingPage, setBuildingPage] = useState(1)
  const [admissionsStepPage, setAdmissionsStepPage] = useState(1)
  const [admissionsFormPage, setAdmissionsFormPage] = useState(1)
  const [buildingUploading, setBuildingUploading] = useState(false)
  const [buildingUploadProgress, setBuildingUploadProgress] = useState(0)
  const [formUploadingIdx, setFormUploadingIdx] = useState(null)
  const [openSections, setOpenSections] = useState(() => new Set())
  function toggleSection(id) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
      const rememberedSection = localStorage.getItem('adminSiteContentLastSection') || ''
      const targetId = rememberedSection || (window.location.hash ? window.location.hash.replace('#', '') : '')
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
    if (!window.confirm('Save site content changes?')) return
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
    if (!window.confirm('Save faculty changes?')) return
    setError('')
    setSavingFaculty(true)
    try {
      let photoUrl = facultyForm.photo?.trim() || ''
      if (facultyImageFile) {
        setUploading(true)
        const result = await uploadImageToSupabase(facultyImageFile, {
          bucket: 'faculty',
        })
        photoUrl = result.publicUrl
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
    if (!window.confirm('Delete this faculty record?')) return
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

  async function handleAdmissionsFormFileUpload(e, globalIdx) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setFormUploadingIdx(globalIdx)
    try {
      const result = await uploadFileToSupabase(file, { bucket: 'forms' })
      updateExtra((ex) => {
        const items = [...(ex.admissions_forms || [])]
        items[globalIdx] = { ...items[globalIdx], url: result.publicUrl }
        return { ...ex, admissions_forms: items }
      })
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setFormUploadingIdx(null)
      e.target.value = ''
    }
  }

  async function handleBuildingFileChange(e, globalIdx) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setBuildingUploading(true)
    setBuildingUploadProgress(0)
    try {
      const result = await uploadImageToSupabase(file, {
        bucket: 'gallery',
      })
      updateExtra((ex) => {
        const items = [...(ex.buildings || [])]
        items[globalIdx] = { ...items[globalIdx], image: result.publicUrl }
        return { ...ex, buildings: items }
      })
    } catch (err) {
      setError(err.message || 'Failed to upload building image')
    } finally {
      setBuildingUploading(false)
      setBuildingUploadProgress(0)
      e.target.value = ''
    }
  }

  function rememberSection(id) {
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
    // (programPage and facilityPage are used in the About accordion)
    setBuildingPage(1)
    setAdmissionsStepPage(1)
    setAdmissionsFormPage(1)
  }

  if (loading) {
    return <LoadingOverlay message="Loading site content…" />
  }

  const extra = content.extra_content || { ...fallbackExtraContent }
  const facultyPageData = paginate(faculty, facultyPage)
  const programPageData = paginate(extra.programs || [], programPage)
  const facilityPageData = paginate(extra.facilities || [], facilityPage)
  const buildingPageData = paginate(extra.buildings || [], buildingPage)
  const defaultContent = { vision: '', mission: '', history: '', contact_email: '', contact_phone: '', extra_content: { ...fallbackExtraContent } }
  const admissionsStepPageData = paginate(extra.admissions_steps || [], admissionsStepPage)
  const admissionsFormPageData = paginate(extra.admissions_forms || [], admissionsFormPage)

  return (
    <>
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-xl font-black text-brand-goldText">Site Content</h1>
        <p className="text-sm text-slate-600">
          Manage content for each page. Click a section to expand and edit.
        </p>
        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      </div>

      {/* -- ACCORDION HELPER ------------------------------------ */}
      {[
        { id: 'home',       label: 'Home',        desc: 'Campus highlights and key site info' },
        { id: 'about',      label: 'About',       desc: 'Vision, mission, history, values, principal, faculty' },
        { id: 'admissions', label: 'Admissions',  desc: 'Steps, requirements, and downloadable forms' },
        { id: 'updates',    label: 'Updates',     desc: 'News posts and announcements' },
        { id: 'events',     label: 'Events',      desc: 'School events and activities' },
        { id: 'gallery',    label: 'Gallery',     desc: 'Campus buildings and photo collections' },
        { id: 'contact',    label: 'Contact',     desc: 'School email and phone number' },
        { id: 'footer',     label: 'Footer',      desc: 'Footer contact info and school details' },
      ].map(({ id, label, desc }) => (
        <div key={id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => toggleSection(id)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold"
          >
            <div>
              <p className="text-sm font-black text-brand-goldText">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <FiChevronDown
              className={['h-5 w-5 shrink-0 text-slate-400 transition-transform', openSections.has(id) ? 'rotate-180' : ''].join(' ')}
              aria-hidden="true"
            />
          </button>

          {openSections.has(id) ? (
            <div className="border-t border-slate-100 px-5 pb-6 pt-4">

              {/* -- HOME ---------------------------------------- */}
              {id === 'home' ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Campus fair highlights on the Home page are pulled automatically from published posts that have a featured image.
                    Add or manage posts in <a href="/admin/posts" className="font-semibold text-brand-blue underline underline-offset-2">Admin Posts</a>.
                  </p>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">About Us Intro</label>
                    <p className="mb-1 text-xs text-slate-400">Short intro shown at the top of the About section.</p>
                    <textarea
                      value={extra.about_intro || ''}
                      onChange={(e) => updateExtra((ex) => ({ ...ex, about_intro: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleSaveContent} disabled={savingContent}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                      <FiSave className="h-4 w-4" aria-hidden="true" />
                      {savingContent ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* -- ABOUT --------------------------------------- */}
              {id === 'about' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Vision</label>
                      <textarea
                        value={content.vision}
                        onChange={(e) => setContent((prev) => ({ ...prev, vision: e.target.value }))}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mission</label>
                      <textarea
                        value={content.mission}
                        onChange={(e) => setContent((prev) => ({ ...prev, mission: e.target.value }))}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">School History</label>
                      <textarea
                        value={content.history}
                        onChange={(e) => setContent((prev) => ({ ...prev, history: e.target.value }))}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Core Values (one per line)</label>
                      <textarea
                        value={(extra.core_values || []).join('\n')}
                        onChange={(e) => updateExtra((ex) => ({ ...ex, core_values: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) }))}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Principal's Message</label>
                      <textarea
                        value={extra.principal_message || ''}
                        onChange={(e) => updateExtra((ex) => ({ ...ex, principal_message: e.target.value }))}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Curriculum Overview (one per line)</label>
                      <textarea
                        value={(extra.curriculum_overview || []).join('\n')}
                        onChange={(e) => updateExtra((ex) => ({ ...ex, curriculum_overview: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) }))}
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleSaveContent} disabled={savingContent}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                      <FiSave className="h-4 w-4" aria-hidden="true" />
                      {savingContent ? 'Saving...' : 'Save About content'}
                    </button>
                    <button type="button" onClick={async () => {
                        setLoading(true); setError('')
                        try { const { data } = await fetchSiteContent(); setContent(data || defaultContent) } catch (err) { setError(err.message || 'Failed') } finally { setLoading(false) }
                      }}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2">
                      <FiRefreshCcw className="h-4 w-4" aria-hidden="true" />
                      Refresh
                    </button>
                  </div>

                  {/* Programs & Facilities sub-section */}
                  <div className="mt-2 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-600">Programs &amp; Facilities</p>
                    <p className="mt-0.5 text-xs text-slate-500">Manage offered programs and facilities displayed on the Academics page.</p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Programs Offered</label>
                          <button type="button" onClick={() => updateExtra((ex) => ({ ...ex, programs: [...(ex.programs || []), { title: '', description: '' }] }))}
                            className="text-xs font-semibold text-brand-blue hover:text-brand-goldText">Add program</button>
                        </div>
                        <div className="space-y-3">
                          {programPageData.items.map((p, idx) => {
                            const globalIdx = (programPageData.page - 1) * PAGE_SIZE + idx
                            return (
                              <div key={globalIdx} className="rounded-lg border border-slate-200 p-3">
                                <input type="text" value={p.title || ''} placeholder="Title"
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.programs || [])]; items[globalIdx] = { ...items[globalIdx], title: e.target.value }; return { ...ex, programs: items } })}
                                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                                <textarea value={p.description || ''} placeholder="Description" rows={2}
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.programs || [])]; items[globalIdx] = { ...items[globalIdx], description: e.target.value }; return { ...ex, programs: items } })}
                                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                                <div className="mt-2 flex justify-end">
                                  <button type="button" onClick={() => updateExtra((ex) => { const items = [...(ex.programs || [])]; items.splice(globalIdx, 1); return { ...ex, programs: items } })}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-500">Remove</button>
                                </div>
                              </div>
                            )
                          })}
                          {(extra.programs?.length || 0) > PAGE_SIZE ? (
                            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                              <button type="button" disabled={programPage <= 1} onClick={() => setProgramPage((p) => Math.max(1, p - 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Previous</button>
                              <span>Page {programPageData.page} of {programPageData.totalPages}</span>
                              <button type="button" disabled={programPage >= programPageData.totalPages} onClick={() => setProgramPage((p) => Math.min(programPageData.totalPages, p + 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Next</button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Facilities &amp; Labs</label>
                          <button type="button" onClick={() => updateExtra((ex) => ({ ...ex, facilities: [...(ex.facilities || []), { title: '', description: '' }] }))}
                            className="text-xs font-semibold text-brand-blue hover:text-brand-goldText">Add facility</button>
                        </div>
                        <div className="space-y-3">
                          {facilityPageData.items.map((f, idx) => {
                            const globalIdx = (facilityPageData.page - 1) * PAGE_SIZE + idx
                            return (
                              <div key={globalIdx} className="rounded-lg border border-slate-200 p-3">
                                <input type="text" value={f.title || ''} placeholder="Title"
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.facilities || [])]; items[globalIdx] = { ...items[globalIdx], title: e.target.value }; return { ...ex, facilities: items } })}
                                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                                <textarea value={f.description || ''} placeholder="Description" rows={2}
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.facilities || [])]; items[globalIdx] = { ...items[globalIdx], description: e.target.value }; return { ...ex, facilities: items } })}
                                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                                <div className="mt-2 flex justify-end">
                                  <button type="button" onClick={() => updateExtra((ex) => { const items = [...(ex.facilities || [])]; items.splice(globalIdx, 1); return { ...ex, facilities: items } })}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-500">Remove</button>
                                </div>
                              </div>
                            )
                          })}
                          {(extra.facilities?.length || 0) > PAGE_SIZE ? (
                            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                              <button type="button" disabled={facilityPage <= 1} onClick={() => setFacilityPage((p) => Math.max(1, p - 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Previous</button>
                              <span>Page {facilityPageData.page} of {facilityPageData.totalPages}</span>
                              <button type="button" disabled={facilityPage >= facilityPageData.totalPages} onClick={() => setFacilityPage((p) => Math.min(facilityPageData.totalPages, p + 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Next</button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Faculty & Staff sub-section */}
                  <div className="mt-2 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-600">Faculty &amp; Staff</p>
                    <p className="mt-0.5 text-xs text-slate-500">Names, roles, and photo URLs shown on the About page.</p>

                    <form className="mt-4 space-y-3" onSubmit={handleSaveFaculty} ref={facultyRef} id="faculty-staff" onFocusCapture={() => rememberSection('faculty-staff')}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Name</label>
                          <input type="text" value={facultyForm.name} required
                            onChange={(e) => setFacultyForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Role / Department</label>
                          <input type="text" value={facultyForm.role} required
                            onChange={(e) => setFacultyForm((prev) => ({ ...prev, role: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Photo URL</label>
                          <input type="url" value={facultyForm.photo} placeholder="https://..."
                            onChange={(e) => setFacultyForm((prev) => ({ ...prev, photo: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            <button type="button" onClick={handleUploadClick} disabled={uploading}
                              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                              <FiImage className="h-4 w-4" aria-hidden="true" />
                              Choose image
                            </button>
                            {facultyImageFile ? <span className="text-xs text-slate-500">{facultyImageFile.name}</span> : null}
                            {uploading ? <span className="text-xs text-slate-500">Uploading... {uploadProgress}%</span> : null}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Order (optional)</label>
                          <input type="number" value={facultyForm.sort_order ?? ''}
                            onChange={(e) => setFacultyForm((prev) => ({ ...prev, sort_order: e.target.value ? Number(e.target.value) : null }))}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="submit" disabled={savingFaculty}
                          className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                          {isEditing ? <FiEdit2 className="h-4 w-4" aria-hidden="true" /> : <FiPlus className="h-4 w-4" aria-hidden="true" />}
                          {savingFaculty ? 'Saving...' : isEditing ? 'Update member' : 'Add member'}
                        </button>
                        {isEditing ? (
                          <button type="button" onClick={resetFacultyForm}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2">
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </form>

                    <div className="mt-4 divide-y divide-slate-200">
                      {faculty.length === 0 ? (
                        <p className="py-2 text-sm text-slate-600">No faculty yet. Add your first member.</p>
                      ) : (
                        facultyPageData.items.map((member) => (
                          <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="flex items-center gap-3">
                              {member.photo ? (
                                <img src={member.photo} alt={member.name} className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200" loading="lazy" />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-sky text-sm font-bold text-brand-goldText ring-1 ring-slate-200">
                                  {member.name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-600">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => startEdit(member)}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2">
                                <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                                Edit
                              </button>
                              <button type="button" onClick={() => handleDeleteFaculty(member.id)}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:-translate-y-[1px] hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
                                <FiTrash className="h-4 w-4" aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      {faculty.length > PAGE_SIZE ? (
                        <div className="flex items-center justify-between pt-3 text-xs text-slate-600">
                          <button type="button" disabled={facultyPage <= 1} onClick={() => setFacultyPage((p) => Math.max(1, p - 1))}
                            className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Previous</button>
                          <span>Page {facultyPageData.page} of {facultyPageData.totalPages}</span>
                          <button type="button" disabled={facultyPage >= facultyPageData.totalPages} onClick={() => setFacultyPage((p) => Math.min(facultyPageData.totalPages, p + 1))}
                            className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Next</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* -- ADMISSIONS ---------------------------------- */}
              {id === 'admissions' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => updateExtra((ex) => ({ ...ex, admissions_steps: [...(ex.admissions_steps || []), { title: '', description: '' }] }))}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-blue/90 hover:-translate-y-[1px] active:translate-y-0">
                          <FiPlus className="h-3.5 w-3.5" aria-hidden="true" /> Add Step
                        </button>
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admission Steps</label>
                      </div>
                      <div className="space-y-3">
                        {admissionsStepPageData.items.map((s, idx) => {
                          const globalIdx = (admissionsStepPageData.page - 1) * PAGE_SIZE + idx
                          return (
                            <div key={globalIdx} className="rounded-lg border border-slate-200 p-3">
                              <input type="text" value={s.title || ''} placeholder="Step title"
                                onChange={(e) => updateExtra((ex) => { const items = [...(ex.admissions_steps || [])]; items[globalIdx] = { ...items[globalIdx], title: e.target.value }; return { ...ex, admissions_steps: items } })}
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                              <textarea value={s.description || ''} placeholder="Description" rows={2}
                                onChange={(e) => updateExtra((ex) => { const items = [...(ex.admissions_steps || [])]; items[globalIdx] = { ...items[globalIdx], description: e.target.value }; return { ...ex, admissions_steps: items } })}
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                              <div className="mt-2 flex justify-end">
                                <button type="button" onClick={() => updateExtra((ex) => { const items = [...(ex.admissions_steps || [])]; items.splice(globalIdx, 1); return { ...ex, admissions_steps: items } })}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-500">Remove</button>
                              </div>
                            </div>
                          )
                        })}
                        {extra.admissions_steps?.length > PAGE_SIZE ? (
                          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                            <button type="button" disabled={admissionsStepPage <= 1} onClick={() => setAdmissionsStepPage((p) => Math.max(1, p - 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Previous</button>
                            <span>Page {admissionsStepPageData.page} of {admissionsStepPageData.totalPages}</span>
                            <button type="button" disabled={admissionsStepPage >= admissionsStepPageData.totalPages} onClick={() => setAdmissionsStepPage((p) => Math.min(admissionsStepPageData.totalPages, p + 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Next</button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Requirements (one per line)</label>
                      <textarea
                        value={(extra.admissions_requirements || []).join('\n')}
                        onChange={(e) => updateExtra((ex) => ({ ...ex, admissions_requirements: e.target.value.split('\n').map((v) => v.trim()).filter(Boolean) }))}
                        rows={7}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateExtra((ex) => ({ ...ex, admissions_forms: [...(ex.admissions_forms || []), { label: '', url: '' }] }))}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-blue/90 hover:-translate-y-[1px] active:translate-y-0">
                        <FiPlus className="h-3.5 w-3.5" aria-hidden="true" /> Add Form
                      </button>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Downloadable Forms</label>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {admissionsFormPageData.items.map((form, idx) => {
                        const globalIdx = (admissionsFormPageData.page - 1) * PAGE_SIZE + idx
                        const isUploading = formUploadingIdx === globalIdx
                        return (
                          <div key={globalIdx} className="rounded-lg border border-slate-200 p-3">
                            <input type="text" value={form.label || ''} placeholder="e.g. Enrollment Form, Admission Process"
                              onChange={(e) => updateExtra((ex) => { const items = [...(ex.admissions_forms || [])]; items[globalIdx] = { ...items[globalIdx], label: e.target.value }; return { ...ex, admissions_forms: items } })}
                              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                            <div className="mt-2 flex items-center gap-2">
                              <input type="url" value={form.url || ''} placeholder="https://... or upload a file below"
                                onChange={(e) => updateExtra((ex) => { const items = [...(ex.admissions_forms || [])]; items[globalIdx] = { ...items[globalIdx], url: e.target.value }; return { ...ex, admissions_forms: items } })}
                                className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm" />
                            </div>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <label className={['inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition', isUploading ? 'cursor-not-allowed opacity-60 ring-slate-200 text-slate-400' : 'text-brand-goldText ring-slate-200 hover:bg-slate-50'].join(' ')}>
                                <FiImage className="h-3.5 w-3.5" aria-hidden="true" />
                                {isUploading ? 'Uploading...' : 'Upload file (PDF, DOCX…)'}
                                <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,application/pdf,application/msword" className="sr-only"
                                  disabled={isUploading}
                                  onChange={(e) => handleAdmissionsFormFileUpload(e, globalIdx)} />
                              </label>
                              {form.url ? (
                                <a href={form.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-goldText truncate max-w-[140px]">
                                  View file
                                </a>
                              ) : null}
                              <button type="button" onClick={() => updateExtra((ex) => { const items = [...(ex.admissions_forms || [])]; items.splice(globalIdx, 1); return { ...ex, admissions_forms: items } })}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-500">Remove</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {extra.admissions_forms?.length > PAGE_SIZE ? (
                      <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                        <button type="button" disabled={admissionsFormPage <= 1} onClick={() => setAdmissionsFormPage((p) => Math.max(1, p - 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Previous</button>
                        <span>Page {admissionsFormPageData.page} of {admissionsFormPageData.totalPages}</span>
                        <button type="button" disabled={admissionsFormPage >= admissionsFormPageData.totalPages} onClick={() => setAdmissionsFormPage((p) => Math.min(admissionsFormPageData.totalPages, p + 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Next</button>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleSaveContent} disabled={savingContent}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                      <FiSave className="h-4 w-4" aria-hidden="true" />
                      {savingContent ? 'Saving...' : 'Save Admissions content'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* -- UPDATES ------------------------------------- */}
              {id === 'updates' ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    News and announcements are managed through the Posts manager.
                  </p>
                  <NavLink to="/admin/posts"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2">
                    Go to Posts Manager
                  </NavLink>
                </div>
              ) : null}

              {/* -- EVENTS -------------------------------------- */}
              {id === 'events' ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Events are managed through the Posts manager. Use the <strong>Events</strong> category when creating a post so it appears on the Events page.
                  </p>
                  <NavLink to="/admin/posts"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2">
                    Go to Posts Manager
                  </NavLink>
                </div>
              ) : null}

              {/* -- GALLERY ------------------------------------- */}
              {id === 'gallery' ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Gallery photos are pulled from posts with featured images. Campus building cards below appear on the Gallery page.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Campus Buildings</label>
                      <button type="button" onClick={() => updateExtra((ex) => ({ ...ex, buildings: [...(ex.buildings || []), { title: '', department: '', image: '' }] }))}
                        className="text-xs font-semibold text-brand-blue hover:text-brand-goldText">Add building</button>
                    </div>

                    <div className="space-y-3">
                      {buildingPageData.items.map((b, idx) => {
                        const globalIdx = (buildingPageData.page - 1) * PAGE_SIZE + idx
                        return (
                          <div key={globalIdx} className="rounded-lg border border-slate-200 p-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="text-xs font-semibold text-slate-600">
                                Building title
                                <input type="text" value={b.title || ''}
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.buildings || [])]; items[globalIdx] = { ...items[globalIdx], title: e.target.value }; return { ...ex, buildings: items } })}
                                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                              </label>
                              <label className="text-xs font-semibold text-slate-600">
                                Department / area
                                <input type="text" value={b.department || ''}
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.buildings || [])]; items[globalIdx] = { ...items[globalIdx], department: e.target.value }; return { ...ex, buildings: items } })}
                                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                              </label>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr] sm:items-center">
                              <label className="text-xs font-semibold text-slate-600">
                                Image URL
                                <input type="url" value={b.image || ''} placeholder="https://..."
                                  onChange={(e) => updateExtra((ex) => { const items = [...(ex.buildings || [])]; items[globalIdx] = { ...items[globalIdx], image: e.target.value }; return { ...ex, buildings: items } })}
                                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
                              </label>
                              <div className="flex flex-col gap-2 text-xs">
                                <label className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-semibold text-brand-goldText ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-slate-50">
                                  <FiImage className="h-4 w-4" aria-hidden="true" />
                                  Upload image
                                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleBuildingFileChange(e, globalIdx)} disabled={buildingUploading} />
                                </label>
                                {buildingUploading ? <span className="text-slate-500">Uploading... {buildingUploadProgress}%</span> : null}
                              </div>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <button type="button" onClick={() => updateExtra((ex) => { const items = [...(ex.buildings || [])]; items.splice(globalIdx, 1); return { ...ex, buildings: items } })}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-500">Remove</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {extra.buildings?.length > PAGE_SIZE ? (
                      <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                        <button type="button" disabled={buildingPage <= 1} onClick={() => setBuildingPage((p) => Math.max(1, p - 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Previous</button>
                        <span>Page {buildingPageData.page} of {buildingPageData.totalPages}</span>
                        <button type="button" disabled={buildingPage >= buildingPageData.totalPages} onClick={() => setBuildingPage((p) => Math.min(buildingPageData.totalPages, p + 1))} className="rounded-full px-3 py-1 font-semibold ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50">Next</button>
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <button type="button" onClick={handleSaveContent} disabled={savingContent}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                        <FiSave className="h-4 w-4" aria-hidden="true" />
                        {savingContent ? 'Saving...' : 'Save Gallery content'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* -- CONTACT ------------------------------------- */}
              {id === 'contact' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contact Email</label>
                      <input type="email" value={content.contact_email} placeholder="info@dmsb.example"
                        onChange={(e) => setContent((prev) => ({ ...prev, contact_email: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contact Phone</label>
                      <input type="tel" value={content.contact_phone} placeholder="+63 000 000 0000"
                        onChange={(e) => setContent((prev) => ({ ...prev, contact_phone: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleSaveContent} disabled={savingContent}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-goldText px-4 py-2 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-brand-goldText/30 transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-60">
                      <FiSave className="h-4 w-4" aria-hidden="true" />
                      {savingContent ? 'Saving...' : 'Save Contact info'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* -- FOOTER -------------------------------------- */}
              {id === 'footer' ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    The footer displays the school contact email and phone number. Update them in the{' '}
                    <button type="button" onClick={() => setOpenSections((prev) => { const next = new Set(prev); next.add('contact'); return next })} className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-goldText">Contact section</button> above.
                  </p>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 text-sm text-slate-700 space-y-1">
                    <p><span className="font-semibold">Email:</span> {content.contact_email || <span className="italic text-slate-400">not set</span>}</p>
                    <p><span className="font-semibold">Phone:</span> {content.contact_phone || <span className="italic text-slate-400">not set</span>}</p>
                  </div>
                </div>
              ) : null}

            </div>
          ) : null}
        </div>
      ))}  
    </div>
    {(savingContent || savingFaculty || uploading || buildingUploading || formUploadingIdx !== null) && (
      <LoadingOverlay message={savingFaculty ? 'Saving faculty…' : uploading || buildingUploading || formUploadingIdx !== null ? 'Uploading…' : 'Saving…'} />
    )}
    </>
  )
}




