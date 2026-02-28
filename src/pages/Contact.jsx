import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiClock, FiMail, FiMapPin, FiMessageCircle, FiPhone, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import usePageMeta from '../hooks/usePageMeta.js'
import { fetchSiteContent } from '../services/siteInfoService.js'

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function FloatingField({ id, label, value, onChange, type = 'text', error }) {
  return (
    <label className="relative block">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={[
          'peer w-full rounded-xl border bg-white px-3 pb-2.5 pt-5 text-sm text-slate-900 outline-none transition duration-200',
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20',
        ].join(' ')}
      />
      <span className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand-goldText">
        {label}
      </span>
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  )
}

export default function Contact() {
  usePageMeta({
    title: 'Contact',
    description: 'Contact Divine Mercy School of Bukidnon for inquiries and enrollment assistance.',
  })

  const [contact, setContact] = useState({
    contact_email: 'info@dmsb.example',
    contact_phone: '+63 000 000 0000',
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchSiteContent()
        if (mounted && data) {
          setContact({
            contact_email: data.contact_email || 'info@dmsb.example',
            contact_phone: data.contact_phone || '+63 000 000 0000',
          })
        }
      } catch (err) {
        console.warn('[Contact] using fallback contact info', err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!toastOpen) return undefined
    const id = setTimeout(() => setToastOpen(false), 2800)
    return () => clearTimeout(id)
  }, [toastOpen])

  const validationErrors = useMemo(() => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!validateEmail(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.subject.trim()) next.subject = 'Subject is required.'
    if (!form.message.trim()) next.message = 'Message is required.'
    return next
  }, [form])

  function onChange(field) {
    return (e) => {
      const value = e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setToastOpen(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 550)
  }

  return (
    <div className="bg-brand-sky">
      <section className="section-space bg-gradient-to-br from-white via-red-50/35 to-rose-50/55">
        <div className="mx-auto max-w-7xl px-4" data-reveal>
          <p className="page-kicker">Get in Touch</p>
          <h1 className="page-h1 mt-4">Contact Us</h1>
          <p className="page-body mt-6 max-w-2xl">Send us a message and we will respond with admissions or campus visit guidance.</p>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="surface-card p-6 sm:p-8" data-reveal id="visit">
              <h2 className="page-h3">Send a Message</h2>
              <p className="page-muted mt-2">We usually reply during office hours.</p>

              <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingField id="name" label="Full Name" value={form.name} onChange={onChange('name')} error={errors.name} />
                  <FloatingField id="email" type="email" label="Email" value={form.email} onChange={onChange('email')} error={errors.email} />
                </div>

                <FloatingField id="subject" label="Subject" value={form.subject} onChange={onChange('subject')} error={errors.subject} />

                <label className="relative block">
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={onChange('message')}
                    placeholder=" "
                    rows={6}
                    className={[
                      'peer w-full rounded-xl border bg-white px-3 pb-2.5 pt-5 text-sm text-slate-900 outline-none transition duration-200',
                      errors.message
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20',
                    ].join(' ')}
                  />
                  <span className="pointer-events-none absolute left-3 top-2 text-xs font-semibold text-slate-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand-goldText">
                    Message
                  </span>
                  {errors.message ? <span className="mt-1 block text-xs font-semibold text-rose-600">{errors.message}</span> : null}
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    'btn-primary btn-ripple w-full',
                    isSubmitting ? 'animate-pulse' : '',
                  ].join(' ')}
                >
                  <FiSend className="h-4 w-4" aria-hidden="true" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="space-y-5" data-reveal>
              <div className="surface-card overflow-hidden">
                <div className="bg-gradient-to-br from-red-700 to-rose-600 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Reach Us</p>
                  <h2 className="mt-2 text-2xl font-bold">Campus Contact Details</h2>
                </div>
                <ul className="space-y-3 p-5 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-goldText" aria-hidden="true" />
                    <span>
                      Bukidnon, Philippines
                      <span className="block text-xs text-slate-500">Update with your exact campus address.</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiPhone className="h-4 w-4 shrink-0 text-brand-goldText" aria-hidden="true" />
                    <a className="hover:text-brand-goldText" href={`tel:${contact.contact_phone || ''}`}>
                      {contact.contact_phone || '+63 000 000 0000'}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiMail className="h-4 w-4 shrink-0 text-brand-goldText" aria-hidden="true" />
                    <a className="truncate hover:text-brand-goldText" href={`mailto:${contact.contact_email || 'info@dmsb.example'}`}>
                      {contact.contact_email || 'info@dmsb.example'}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 shrink-0 text-brand-goldText" aria-hidden="true" />
                    <span>Mon-Fri, 8:00 AM - 5:00 PM</span>
                  </li>
                </ul>

                <div className="grid gap-2 border-t border-slate-200 p-5">
                  <a
                    href="https://wa.me/639000000000"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-base rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                    WhatsApp Quick Chat
                  </a>
                  <a
                    href="https://m.me/dmsb"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary rounded-xl"
                  >
                    <FiMessageCircle className="h-4 w-4" aria-hidden="true" />
                    Messenger Chat
                  </a>
                </div>
              </div>

              <div className="surface-card overflow-hidden">
                <div className="px-5 py-4">
                  <p className="text-sm font-extrabold text-brand-goldText">Campus Map</p>
                  <p className="text-xs text-slate-500">Interactive location preview</p>
                </div>
                <div className="group overflow-hidden">
                  <iframe
                    title="School location map"
                    className="h-56 w-full origin-center transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0589883963135!2d125.3919950747659!3d7.783570792236212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fec2d955555555%3A0x5e4a52a129c2ee46!2sDivine%20Mercy%20School%20of%20Buikidnon%2C%20Inc.!5e0!3m2!1sen!2sph!4v1771298618796!5m2!1sen!2sph"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <a
        href="https://m.me/dmsb"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-[150] inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
      >
        <FiMessageCircle className="h-4 w-4" aria-hidden="true" />
        Chat
      </a>

      {toastOpen ? (
        <div className="fixed right-4 top-24 z-[160] inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-md">
          <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
          Message sent successfully.
        </div>
      ) : null}
    </div>
  )
}
