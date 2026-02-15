import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiImage, FiSave, FiUpload } from 'react-icons/fi'
import { useCategoriesQuery } from '../../hooks/useCategoriesQuery.js'
import { fetchPostById, savePost } from '../../services/postService.js'
import { uploadImageToCloudinary } from '../../lib/cloudinary.js'

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(10),
  featured_image_url: z.string().url().optional().or(z.literal('')),
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { status: 'draft', is_featured: false } })

  useEffect(() => {
    if (!postId) return
    async function load() {
      const { data } = await fetchPostById(postId)
      if (data) reset({ ...data })
    }
    load()
  }, [postId, reset])

  async function onSubmit(values) {
    const payload = {
      ...values,
      featured_image_url: values.featured_image_url || null,
      video_url: values.video_url || null,
      category_id: values.category_id || null,
      is_featured: Boolean(values.is_featured),
    }
    const { data } = await savePost(postId ? { ...payload, id: postId } : payload)
    if (data) navigate('/admin/posts')
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImageToCloudinary(file, { folder: 'school-vlogs' })
      setValue('featured_image_url', res.secureUrl)
    } catch (err) {
      alert(err.message)
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
          disabled={isSubmitting}
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
                Upload
                <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {uploading ? <p className="mt-1 text-xs text-slate-500">Uploading to Cloudinary…</p> : null}
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

        <div className="rounded-lg bg-brand-sky/60 p-4 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
          <div className="flex items-center gap-2 font-semibold">
            <FiImage className="h-4 w-4 text-brand-goldText" aria-hidden="true" />
            Media guidelines
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Images are uploaded via Cloudinary with auto format + compression.</li>
            <li>Use landscape 16:9 images for vlogs; square/4:5 for news.</li>
            <li>For scheduled posts, set status to Draft; publish later.</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
