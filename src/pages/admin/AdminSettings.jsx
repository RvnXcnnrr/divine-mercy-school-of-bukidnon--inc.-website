import usePageMeta from '../../hooks/usePageMeta.js'

export default function AdminSettings() {
  usePageMeta({ title: 'Admin Settings' })
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-brand-goldText">Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Environment and integration notes.</p>
      </div>
      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Set these in your .env file and restart the dev server:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-200">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
          <li>VITE_CLOUDINARY_CLOUD_NAME</li>
          <li>VITE_CLOUDINARY_UPLOAD_PRESET (unsigned or signed)</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          For signed Cloudinary uploads, generate the signature server-side (Supabase Edge Function) and call from the admin uploader.
        </p>
      </div>
    </div>
  )
}
