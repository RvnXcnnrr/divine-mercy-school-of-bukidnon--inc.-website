import { useEffect, useState } from 'react'
import { FiClock, FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi'
import usePageMeta from '../hooks/usePageMeta.js'
import { fetchSiteContent } from '../services/siteInfoService.js'

export default function Contact() {
  usePageMeta({
    title: 'Contact',
    description: 'Contact Divine Mercy School of Bukidnon, Inc. for inquiries and enrollment assistance.',
  })

  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [contact, setContact] = useState({ contact_email: 'info@dmsb.example', contact_phone: '+63 000 000 0000' })

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
        console.warn('[Contact] Using fallback contact info', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  function onSubmit(e) {
    e.preventDefault()
    setStatus({
      type: 'success',
      message: 'Message sent (demo). Please connect this form to your preferred email or API endpoint.',
    })
  }

  return (
    <div>
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div className="max-w-2xl">
              <h1 className="gold-gradient-text text-3xl font-black tracking-tight sm:text-4xl">Contact Us</h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                We’re here to help. Send a message or reach us through the contact details below.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href="https://m.me/dmsb"
                className="gold-gradient-bg inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                Message on Messenger
              </a>
              <a
                href="/forms/Admissions-Form.pdf"
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
              >
                Open Enroll Form
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-brand-sky leading-none dark:bg-slate-950" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-white dark:text-slate-900 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" data-reveal id="visit">
              <h2 className="gold-gradient-text text-xl font-black tracking-tight">Send a Message</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">We’ll respond as soon as we can.</p>

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Full Name</span>
                  <input
                    required
                    name="name"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Subject</span>
                <input
                  required
                  name="subject"
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="How can we help?"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Message</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Write your message..."
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-goldText px-4 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <FiSend className="h-4 w-4" aria-hidden="true" />
                Send Message
              </button>

              <p className="text-sm" aria-live="polite">
                {status.type === 'success' ? (
                  <span className="text-emerald-700 dark:text-emerald-400">{status.message}</span>
                ) : null}
              </p>
            </form>
            </div>

            <div className="space-y-5" data-reveal>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h2 className="gold-gradient-text text-xl font-black tracking-tight">Contact Details</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <li className="flex items-start gap-2">
                    <FiMapPin className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
                    <span>
                      Bukidnon, Philippines
                      <span className="block text-xs text-slate-500 dark:text-slate-400">(Update with your exact campus address)</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiPhone className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    <a className="hover:text-brand-goldText" href={`tel:${contact.contact_phone || ''}`}>
                      {contact.contact_phone || '+63 000 000 0000'}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiMail className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    <a className="hover:text-brand-goldText" href={`mailto:${contact.contact_email || 'info@dmsb.example'}`}>
                      {contact.contact_email || 'info@dmsb.example'}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiClock className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    <span>Mon–Fri, 8:00 AM – 5:00 PM</span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href="https://m.me/dmsb"
                    className="gold-gradient-bg inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-extrabold text-white transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                  >
                    Message on Messenger
                  </a>
                  <a
                    href="/forms/Admissions-Form.pdf"
                    className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-extrabold text-brand-goldText ring-1 ring-slate-200 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800"
                  >
                    Open enrollment form
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <div className="px-6 py-4">
                  <p className="text-sm font-extrabold text-brand-goldText">Map</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Google Maps location for the campus.</p>
                </div>
                <iframe
                  title="School location map"
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0589883963135!2d125.3919950747659!3d7.783570792236212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32fec2d955555555%3A0x5e4a52a129c2ee46!2sDivine%20Mercy%20School%20of%20Buikidnon%2C%20Inc.!5e0!3m2!1sen!2sph!4v1771298618796!5m2!1sen!2sph"
                  allowFullScreen
                />
                <div className="px-6 pb-5 pt-3">
                  <a
                    className="inline-flex items-center justify-center rounded-md bg-brand-goldText px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                    href="https://maps.app.goo.gl/UDxpY95KhLdhDWeQ8"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full overflow-hidden bg-white leading-none dark:bg-slate-900" aria-hidden="true">
        <svg
          className="block h-8 w-full fill-current text-brand-sky dark:text-slate-950 sm:h-10"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0,32 C240,80 480,80 720,40 C960,0 1200,0 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </div>
  )
}
