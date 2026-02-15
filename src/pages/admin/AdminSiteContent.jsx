import { useEffect, useMemo, useRef, useState } from 'react'
import { FiEdit2, FiImage, FiPlus, FiRefreshCcw, FiSave, FiTrash } from 'react-icons/fi'
import usePageMeta from '../../hooks/usePageMeta.js'
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

function sortFaculty(list = []) {
  return [...list].sort((a, b) => {
    const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  })
}

export default function AdminSiteContent() {
  usePageMeta({ title: 'Site Content' })

  const [content, setContent] = useState({ vision: '', mission: '', history: '', contact_email: '', contact_phone: '' })
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
        setContent(siteContent || { vision: '', mission: '', history: '', contact_email: '', contact_phone: '' })
        const sorted = sortFaculty(people || [])
        setFaculty(sorted)
        cacheFaculty(sorted)
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
    e.preventDefault()
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

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 animate-pulse dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
        Loading site content…
      </div>
    )
  }

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
            faculty.map((member) => (
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
        </div>
      </section>
    </div>
  )
}
