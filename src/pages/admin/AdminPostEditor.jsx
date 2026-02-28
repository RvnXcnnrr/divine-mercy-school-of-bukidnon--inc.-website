import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiClock, FiEye, FiSave, FiUpload, FiX } from 'react-icons/fi'
import { useCategoriesQuery } from '../../hooks/useCategoriesQuery.js'
import { fetchPostById, savePost } from '../../services/postService.js'
import { uploadImageToSupabase } from '../../lib/supabaseStorage.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(10),
  featured_image_url: z.string().url().optional().or(z.literal('')),
  gallery_images: z.array(z.string().url()).optional(),
  images: z.array(z.string().url()).optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  category_id: z.string().optional(),
  status: z.enum(['draft', 'published']).default('published'),
  is_featured: z.boolean().default(false),
})

function draftKeyFor(postId) {
  return `admin-post-draft:${postId || 'new'}`
}

const SUBMIT_DEBOUNCE_MS = 700

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

export default function AdminPostEditor() {
  const params = useParams()
  const postId = params.postId === 'new' ? null : params.postId
  const draftKey = draftKeyFor(postId)
  const navigate = useNavigate()
  const { data: categories = [] } = useCategoriesQuery()
  const [uploading, setUploading] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryUrls, setGalleryUrls] = useState([])
  const [galleryField, setGalleryField] = useState('gallery_images')
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [draggingUpload, setDraggingUpload] = useState(false)
  const [submissionLocked, setSubmissionLocked] = useState(false)
  const submitInFlightRef = useRef(false)
  const lastSubmitAtRef = useRef(0)
  const idempotencyKeyRef = useRef('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isDirty, errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category_id: '',
      featured_image_url: '',
      video_url: '',
      status: 'draft',
      is_featured: false,
      gallery_images: [],
    },
  })

  const watchedValues = watch()
  const queuedImagePreview = useMemo(() => {
    if (!galleryFiles.length) return ''
    return URL.createObjectURL(galleryFiles[0])
  }, [galleryFiles])

  const featuredPreview = useMemo(() => {
    return queuedImagePreview || galleryUrls[0] || watchedValues.featured_image_url || ''
  }, [queuedImagePreview, galleryUrls, watchedValues.featured_image_url])

  useEffect(() => {
    return () => {
      if (queuedImagePreview?.startsWith('blob:')) URL.revokeObjectURL(queuedImagePreview)
    }
  }, [queuedImagePreview])

  useEffect(() => {
    if (postId) {
      idempotencyKeyRef.current = ''
      return
    }
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = createUuidV4()
    }
  }, [postId])

  useEffect(() => {
    if (!postId) return

    async function load() {
      const { data } = await fetchPostById(postId)
      if (!data) return
      const gallery = data.gallery_images || data.images || []
      reset({
        ...data,
        gallery_images: gallery,
        images: data.images || undefined,
      })
      setGalleryUrls(gallery)
      if (data.gallery_images && Array.isArray(data.gallery_images)) setGalleryField('gallery_images')
      else if (data.images && Array.isArray(data.images)) setGalleryField('images')
    }

    load()
  }, [postId, reset])

  useEffect(() => {
    if (postId) return
    const raw = window.localStorage.getItem(draftKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.values) reset(parsed.values)
      if (Array.isArray(parsed?.galleryUrls)) setGalleryUrls(parsed.galleryUrls)
      if (parsed?.galleryField) setGalleryField(parsed.galleryField)
      if (parsed?.savedAt) setLastAutoSavedAt(new Date(parsed.savedAt))
      if (parsed?.idempotencyKey) idempotencyKeyRef.current = parsed.idempotencyKey
    } catch {
      window.localStorage.removeItem(draftKey)
    }
  }, [draftKey, postId, reset])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isDirty || postId) return
      const payload = {
        values: watchedValues,
        galleryUrls,
        galleryField,
        savedAt: new Date().toISOString(),
        idempotencyKey: idempotencyKeyRef.current,
      }
      window.localStorage.setItem(draftKey, JSON.stringify(payload))
      setLastAutoSavedAt(new Date())
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [draftKey, galleryField, galleryUrls, isDirty, postId, watchedValues])

  function handleGallerySelect(files) {
    if (!files?.length) return
    setGalleryFiles((prev) => [...prev, ...files])
  }

  function handleUnifiedUpload(files) {
    if (!files?.length) return
    handleGallerySelect(files)
  }

  function removeGalleryUrl(url) {
    setGalleryUrls((prev) => prev.filter((item) => item !== url))
  }

  function removeGalleryFile(name) {
    setGalleryFiles((prev) => prev.filter((file) => file.name !== name))
  }

  async function onSubmit(values) {
    const now = Date.now()
    if (submitInFlightRef.current) return
    if (now - lastSubmitAtRef.current < SUBMIT_DEBOUNCE_MS) return
    lastSubmitAtRef.current = now
    submitInFlightRef.current = true
    setSubmissionLocked(true)
    try {
      const confirmed = window.confirm('Save changes to this post?')
      if (!confirmed) return

      setUploading(true)
      const existingGallery = [...galleryUrls]
      if (!postId && !idempotencyKeyRef.current) {
        idempotencyKeyRef.current = createUuidV4()
      }
      const idempotencyKey = postId ? null : idempotencyKeyRef.current
      if (!postId && idempotencyKey) {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({
            values,
            galleryUrls: existingGallery,
            galleryField,
            savedAt: new Date().toISOString(),
            idempotencyKey,
          })
        )
      }

      const newGalleryUrls = []
      for (const file of galleryFiles) {
        const uploaded = await uploadImageToSupabase(file, { bucket: 'posts' })
        newGalleryUrls.push(uploaded.publicUrl)
      }

      const galleryImages = [...existingGallery, ...newGalleryUrls]
      const featuredUrl = values.featured_image_url || galleryImages[0] || null

      const payload = {
        ...values,
        status: values.status || 'draft',
        featured_image_url: featuredUrl,
        video_url: values.video_url || null,
        category_id: values.category_id || null,
        is_featured: Boolean(values.is_featured),
      }

      const preferredFields = galleryField === 'images' ? ['images', 'gallery_images'] : ['gallery_images', 'images']
      let savedData = null
      let lastError = null

      for (const field of preferredFields) {
        const candidate = { ...payload }
        if (field === 'images') {
          delete candidate.gallery_images
          candidate.images = galleryImages.length ? galleryImages : null
        } else {
          delete candidate.images
          candidate.gallery_images = galleryImages.length ? galleryImages : null
        }

        try {
          const basePayload = postId ? { ...candidate, id: postId } : { ...candidate, idempotency_key: idempotencyKey }
          const { data } = await savePost(basePayload)
          savedData = data
          if (field !== galleryField) setGalleryField(field)
          break
        } catch (error) {
          lastError = error
          if (!isMissingColumnError(error, field)) {
            throw error
          }
        }
      }

      if (!savedData) {
        throw lastError || new Error('Failed to save post')
      }

      window.localStorage.removeItem(draftKey)
      if (!postId) {
        idempotencyKeyRef.current = createUuidV4()
      }
      setGalleryFiles([])
      setLastAutoSavedAt(new Date())
      navigate('/admin/posts')
    } catch (error) {
      alert(error.message || 'Failed to save post')
    } finally {
      setUploading(false)
      submitInFlightRef.current = false
      setSubmissionLocked(false)
    }
  }

  const isSaving = uploading || isSubmitting || submissionLocked
  const saveLabel = isSaving ? 'Saving...' : 'Save Changes'
  const autosaveText = (() => {
    if (isSaving) return 'Saving content...'
    if (isDirty) return 'Unsaved changes'
    if (!lastAutoSavedAt) return 'Ready'
    return `Autosaved ${lastAutoSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  })()

  function handleCancelEdit() {
    if (isDirty) {
      const confirmed = window.confirm('Discard unsaved changes and return to posts?')
      if (!confirmed) return
    }
    navigate('/admin/posts')
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={postId ? 'Edit Post' : 'Create New Post'}
        description="Set post details, media, and publish status in one streamlined layout."
      />

      <section className="sticky top-[74px] z-20 admin-card bg-white/90 p-3 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-slate-600">
            <FiClock className="h-4 w-4" aria-hidden="true" />
            {autosaveText}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleCancelEdit} className="admin-button-secondary">
              Cancel
            </button>
            <button type="button" onClick={() => setPreviewOpen(true)} className="admin-button-secondary">
              <FiEye className="h-4 w-4" aria-hidden="true" />
              Preview
            </button>
            <button type="submit" form="post-form" disabled={isSaving} className="admin-button-primary">
              <FiSave className="h-4 w-4" aria-hidden="true" />
              {saveLabel}
            </button>
          </div>
        </div>
      </section>

      <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <article className="admin-card p-5">
            <h2 className="text-base font-semibold text-slate-900">Post Info</h2>
            <p className="mt-1 text-sm text-slate-500">Core metadata for your post.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Title
                <input {...register('title')} className="admin-input mt-1" placeholder="Post title" />
                {errors.title ? <span className="mt-1 block text-xs text-rose-600">Title must be at least 3 characters.</span> : null}
              </label>
              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Category
                <select {...register('category_id')} className="admin-input mt-1">
                  <option value="">Unassigned</option>
                  {categories.map((category) => (
                    <option key={category.id || category.slug} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          <article className="admin-card p-5">
            <h2 className="text-base font-semibold text-slate-900">Publishing & Media</h2>
            <p className="mt-1 text-sm text-slate-500">Set visibility and upload images used in gallery and previews.</p>

            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Status
                <select {...register('status')} className="admin-input mt-1">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <input type="checkbox" {...register('is_featured')} className="peer sr-only" />
                <span className="relative inline-flex h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-brand-goldText">
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                </span>
                <span className="text-sm font-medium text-slate-700">Feature on homepage</span>
              </label>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-700">Upload image(s)</p>
                <p className="mt-1 text-xs text-slate-500">Select one or more images. They are saved to gallery automatically.</p>

                <div
                className="mt-3"
              >
                <div
                className={[
                  'rounded-xl border-2 border-dashed p-4 text-center transition',
                  draggingUpload ? 'border-brand-goldText bg-rose-50' : 'border-slate-300 bg-slate-50/60',
                ].join(' ')}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDraggingUpload(true)
                }}
                onDragLeave={() => setDraggingUpload(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDraggingUpload(false)
                  handleUnifiedUpload(Array.from(event.dataTransfer.files || []))
                }}
              >
                <input
                  id="media-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleUnifiedUpload(Array.from(event.target.files || []))}
                />
                <label htmlFor="media-upload-input" className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-goldText">
                  <FiUpload className="h-4 w-4" aria-hidden="true" />
                  Upload image(s)
                </label>
                <p className="mt-2 text-xs text-slate-500">Select one or more images. Drag and drop is supported.</p>
              </div>
              </div>

              {(galleryUrls.length || galleryFiles.length) > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {galleryUrls.map((url) => (
                    <div key={url} className="relative overflow-hidden rounded-xl border border-slate-200">
                      <img src={url} alt="Gallery" className="h-28 w-full object-cover" loading="lazy" />
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(url)}
                        className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-slate-700 ring-1 ring-slate-200 hover:bg-white"
                        aria-label="Remove image"
                      >
                        <FiX className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {galleryFiles.map((file) => (
                    <div key={file.name} className="relative rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <p className="line-clamp-2 pr-6">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(file.name)}
                        className="absolute right-1 top-1 rounded-md p-1 hover:bg-amber-100"
                        aria-label="Remove queued image"
                      >
                        <FiX className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              </div>
            </div>
          </article>
        </div>

        <article className="admin-card p-5">
          <h2 className="text-base font-semibold text-slate-900">Content</h2>
          <p className="mt-1 text-sm text-slate-500">Write the main post body.</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">
              Content
              <textarea
                {...register('content')}
                rows={12}
                className="admin-input mt-1 min-h-[420px]"
                placeholder="Write your post content here..."
              />
              {errors.content ? <span className="mt-1 block text-xs text-rose-600">Content must be at least 10 characters.</span> : null}
            </label>
          </div>
        </article>
      </form>

      {previewOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Post Preview</h2>
              <button type="button" onClick={() => setPreviewOpen(false)} className="admin-button-secondary px-2" aria-label="Close preview">
                <FiX className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {featuredPreview ? (
              <img src={featuredPreview} alt="Preview cover" className="mt-4 h-52 w-full rounded-xl object-cover" />
            ) : null}
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">{watchedValues.title || 'Untitled post'}</h3>
            {watchedValues.excerpt ? <p className="mt-2 text-sm text-slate-600">{watchedValues.excerpt}</p> : null}
            <div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{watchedValues.content || 'No content yet.'}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function isMissingColumnError(error, field) {
  const message = String(error?.message || '').toLowerCase()
  const normalizedField = String(field || '').toLowerCase()
  return message.includes('column') && message.includes('does not exist') && message.includes(normalizedField)
}
