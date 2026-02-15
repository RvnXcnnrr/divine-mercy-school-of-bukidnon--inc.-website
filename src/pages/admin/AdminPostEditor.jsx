import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiImage, FiSave, FiUpload, FiX } from 'react-icons/fi'
import { useCategoriesQuery } from '../../hooks/useCategoriesQuery.js'
import { fetchPostById, savePost } from '../../services/postService.js'
import { uploadImageToCloudinary } from '../../lib/cloudinary.js'

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
  status: z.enum(['draft', 'published']).default('draft'),
  is_featured: z.boolean().default(false),
})

export default function AdminPostEditor() {
  const params = useParams()
  const postId = params.postId === 'new' ? null : params.postId
  const navigate = useNavigate()
  const { data: categories = [] } = useCategoriesQuery()
  const [uploading, setUploading] = useState(false)
  const [featuredFile, setFeaturedFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryUrls, setGalleryUrls] = useState([])
  const [galleryField, setGalleryField] = useState('gallery_images')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { status: 'draft', is_featured: false, gallery_images: [] } })

  const featuredUrlValue = watch('featured_image_url')

  useEffect(() => {
    if (!postId) return
    async function load() {
      const { data } = await fetchPostById(postId)
      if (data) {
        const gallery = data.gallery_images || data.images || []
        reset({ ...data, gallery_images: gallery, images: data.images || undefined })
        setGalleryUrls(gallery)
        if (data.gallery_images && Array.isArray(data.gallery_images)) setGalleryField('gallery_images')
        else if (data.images && Array.isArray(data.images)) setGalleryField('images')
      }
    }
    load()
  }, [postId, reset])

  function handleFeaturedSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFeaturedFile(file)
    setValue('featured_image_url', '')
  }

  function clearFeatured() {
    setFeaturedFile(null)
    setValue('featured_image_url', '')
  }

  function handleGallerySelect(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setGalleryFiles((prev) => [...prev, ...files])
  }

  function removeGalleryUrl(url) {
    setGalleryUrls((prev) => prev.filter((item) => item !== url))
  }

  function removeGalleryFile(name) {
    setGalleryFiles((prev) => prev.filter((file) => file.name !== name))
  }

  async function onSubmit(values) {
    setUploading(true)
    let featuredUrl = values.featured_image_url || null
    const existingGallery = [...galleryUrls]

    try {
      if (featuredFile) {
        const uploaded = await uploadImageToCloudinary(featuredFile, { folder: 'posts' })
        featuredUrl = uploaded.secureUrl
      }

      const newGalleryUrls = []
      for (const file of galleryFiles) {
        const uploaded = await uploadImageToCloudinary(file, { folder: 'posts' })
        newGalleryUrls.push(uploaded.secureUrl)
      }

      const galleryImages = [...existingGallery, ...newGalleryUrls]

      const payload = {
        ...values,
        featured_image_url: featuredUrl,
        video_url: values.video_url || null,
        category_id: values.category_id || null,
        is_featured: Boolean(values.is_featured),
      }

      if (galleryField === 'images') {
        delete payload.gallery_images
        payload.images = galleryImages.length ? galleryImages : null
      } else if (galleryField === 'gallery_images') {
        delete payload.images
        payload.gallery_images = galleryImages.length ? galleryImages : null
      } else if (galleryImages.length) {
        alert('Gallery images were not saved because the posts table lacks an images/gallery_images column. Please add one to Supabase.')
      }

      const { data } = await savePost(postId ? { ...payload, id: postId } : payload)
      if (data) navigate('/admin/posts')
    } catch (err) {
      alert(err.message || 'Failed to save post')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-brand-goldText">{postId ? 'Edit Post' : 'New Post'}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Create, schedule, or draft posts.</p>
        </div>
        <button
          type="submit"
          form="post-form"
          disabled={isSubmitting || uploading}
          className="inline-flex items-center gap-2 rounded-md bg-brand-goldText px-4 py-2 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-70"
        >
          <FiSave className="h-4 w-4" aria-hidden="true" />
          Save
        </button>
      </div>

      <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Title
            <input
              {...register('title')}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Post title"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Slug
            <input
              {...register('slug')}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="auto-generated if blank"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Category
            <select
              {...register('category_id')}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Unassigned</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.slug} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <span className="text-xs text-slate-500">Quick set:</span>
              <button
                type="button"
                onClick={() => setValue('category_id', 'field-trip')}
                className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:ring-amber-800"
              >
                Field Trip
              </button>
              <button
                type="button"
                onClick={() => setValue('category_id', 'event')}
                className="inline-flex items-center gap-2 rounded-full bg-brand-sky px-3 py-1 text-brand-goldText ring-1 ring-slate-200 transition hover:bg-brand-sky/80 dark:bg-slate-800 dark:ring-slate-700"
              >
                Event
              </button>
            </div>
          </label>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Status
            <select
              {...register('status')}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input type="checkbox" {...register('is_featured')} className="h-4 w-4" />
            Featured on homepage
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Excerpt
          <textarea
            {...register('excerpt')}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Short summary"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Content
          <textarea
            {...register('content')}
            rows={8}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Use Markdown or rich text content"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Featured image URL
            <div className="mt-1 flex items-center gap-2">
              <input
                {...register('featured_image_url')}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="https://res.cloudinary.com/..."
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-800 dark:ring-slate-700">
                <FiUpload className="h-4 w-4" aria-hidden="true" />
                Choose file
                <input type="file" accept="image/*" className="sr-only" onChange={handleFeaturedSelect} disabled={uploading} />
              </label>
              {featuredFile ? (
                <button
                  type="button"
                  onClick={clearFeatured}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                  Clear
                </button>
              ) : null}
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {featuredFile ? <p>Queued: {featuredFile.name}</p> : null}
              {!featuredFile && (featuredUrlValue || '').length > 0 ? <p>Using existing URL.</p> : null}
            </div>
          </label>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Video URL (YouTube / Facebook)
            <input
              {...register('video_url')}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="https://youtube.com/watch?v=..."
            />
          </label>
        </div>

        <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <FiImage className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
            Gallery images (optional)
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">Select multiple images; they upload only after you click Save.</p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-brand-goldText ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-800 dark:ring-slate-700">
              <FiUpload className="h-4 w-4" aria-hidden="true" />
              Add images
              <input type="file" accept="image/*" multiple className="sr-only" onChange={handleGallerySelect} disabled={uploading} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {galleryUrls.map((url) => (
              <div key={url} className="relative overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                <img src={url} alt="Gallery" className="h-32 w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => removeGalleryUrl(url)}
                  className="absolute right-1 top-1 inline-flex items-center justify-center rounded-full bg-white/90 p-1 text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-white dark:bg-slate-900/90 dark:text-slate-200 dark:ring-slate-700"
                  aria-label="Remove image"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}

            {galleryFiles.map((file) => (
              <div key={file.name} className="relative overflow-hidden rounded-md border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30">
                <div className="flex h-32 items-center justify-center p-3 text-center text-xs text-amber-800 dark:text-amber-100">
                  {file.name}
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryFile(file.name)}
                  className="absolute right-1 top-1 inline-flex items-center justify-center rounded-full bg-white/90 p-1 text-amber-800 shadow ring-1 ring-amber-200 transition hover:bg-white dark:bg-slate-900/90 dark:text-amber-100 dark:ring-amber-700"
                  aria-label="Remove queued image"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-brand-sky/60 p-4 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
          <div className="flex items-center gap-2 font-semibold">
            <FiImage className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
            Media guidelines
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Images are uploaded via Cloudinary with auto format + compression.</li>
            <li>Use landscape 16:9 images for vlogs; square/4:5 for news.</li>
            <li>Uploads happen only after you click Save.</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
