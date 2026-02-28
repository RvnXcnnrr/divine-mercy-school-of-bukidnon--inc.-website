import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa6'
import { subscribeEmail } from '../services/subscriberService.js'
import { fetchSiteContent } from '../services/siteInfoService.js'
import { readPublishedSiteManagementFromContent } from '../services/siteManagementService.js'

const LOCKED_DEVELOPER_CREDIT = 'Developed by Javy M. Rodillon'

function withLockedDeveloperCredit(settings = {}) {
  return {
    ...settings,
    showDeveloperCredit: true,
    developerCredit: LOCKED_DEVELOPER_CREDIT,
  }
}

export default function Footer() {
  const [logoOk, setLogoOk] = useState(true)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [contact, setContact] = useState({
    contact_email: 'info@dmsb.example',
    contact_phone: '+63 000 000 0000',
    address: 'Bukidnon, Philippines',
    office_hours: 'Mon-Fri, 8:00 AM - 5:00 PM',
  })
  const [footerSettings, setFooterSettings] = useState({
    description:
      'A private Catholic school committed to faith-based education, discipline, and service. We bring education closer to every child.',
    socialLinks: [],
    navLinks: [],
    copyrightText: 'Divine Mercy School of Bukidnon, Inc. All rights reserved.',
    showDeveloperCredit: true,
    developerCredit: LOCKED_DEVELOPER_CREDIT,
  })
  const [branding, setBranding] = useState({
    schoolName: 'Divine Mercy School of Bukidnon, Inc.',
    logoUrl: '/logo.png',
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await fetchSiteContent()
        if (mounted && data) {
          const settings = readPublishedSiteManagementFromContent(data)
          setFooterSettings(withLockedDeveloperCredit(settings.footer || {}))
          setBranding({
            schoolName: settings.globalSettings?.schoolName || 'Divine Mercy School of Bukidnon, Inc.',
            logoUrl: settings.globalSettings?.logoUrl || '/logo.png',
          })
          setContact({
            contact_email: settings.contactPage?.email || data.contact_email || 'info@dmsb.example',
            contact_phone: settings.contactPage?.phone || data.contact_phone || '+63 000 000 0000',
            address: settings.contactPage?.address || 'Bukidnon, Philippines',
            office_hours: settings.contactPage?.officeHours || 'Mon-Fri, 8:00 AM - 5:00 PM',
          })
        }
      } catch (err) {
        console.warn('[Footer] Using fallback contact info', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (!email) return
    try {
      setStatus('loading')
      await subscribeEmail(email)
      setStatus('success')
      setEmail('')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const socialLinks = (footerSettings.socialLinks || []).filter((item) => item?.isVisible !== false && item?.url)
  const navLinks = (footerSettings.navLinks || []).filter((item) => item?.isVisible !== false && item?.path)

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-brand-sky/70 backdrop-blur">
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-goldText/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-brand-goldText/60 shadow-sm">
                {logoOk ? (
                  <img
                    src={branding.logoUrl || '/logo.png'}
                    alt="Divine Mercy School of Bukidnon, Inc. logo"
                    className="h-full w-full object-contain"
                    loading="lazy"
                    width="48"
                    height="48"
                    onError={() => setLogoOk(false)}
                  />
                ) : (
                  <span className="text-sm font-black text-brand-navy" aria-hidden="true">
                    DMSB
                  </span>
                )}
              </span>
              <div>
                <p className="text-lg font-black text-brand-goldText leading-tight">{branding.schoolName || 'Divine Mercy School of Bukidnon, Inc.'}</p>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-navy/80">Faith. Discipline. Service.</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-slate-700">
              {footerSettings.description || 'A private Catholic school committed to faith-based education, discipline, and service. We bring education closer to every child.'}
            </p>
            <div className="flex items-center gap-2">
              {(socialLinks.length
                ? socialLinks
                : [
                    { platform: 'Facebook', url: 'https://www.facebook.com/dmsbherald' },
                    { platform: 'YouTube', url: 'https://www.youtube.com/' },
                    { platform: 'Instagram', url: 'https://www.instagram.com/' },
                  ]
              ).map((item) => {
                const key = `${item.platform}-${item.url}`
                const platform = String(item.platform || '').toLowerCase()
                const Icon = platform.includes('youtube') ? FaYoutube : platform.includes('instagram') ? FaInstagram : FaFacebookF
                return (
                  <a
                    key={key}
                    href={item.url}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-goldText shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:bg-brand-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    aria-label={item.platform || 'Social'}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Stay in the loop</p>
            <h3 className="mt-1 text-lg font-black text-brand-goldText">Subscribe for school updates</h3>
            <p className="mt-1 text-sm text-slate-600">News, events, and admissions remindersâ€”no spam.</p>
            <form className="mt-4 space-y-2" onSubmit={onSubmit}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center justify-center rounded-full bg-brand-goldText px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:-translate-y-[1px] hover:bg-brand-goldText/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:opacity-70"
                >
                  Subscribe
                </button>
              </div>
              {status === 'success' ? (
                <p className="text-[11px] text-emerald-700">Subscribed. Check your inbox.</p>
              ) : null}
              {status === 'error' ? (
                <p className="text-[11px] text-rose-600">Failed to subscribe. Try again.</p>
              ) : null}
            </form>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/60 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-sm font-extrabold text-brand-goldText">Explore</p>
            <ul className="space-y-2 text-sm">
              {(navLinks.length
                ? navLinks
                : [
                    { label: 'About', path: '/about' },
                    { label: 'Academics', path: '/academics' },
                    { label: 'Admissions', path: '/admissions' },
                    { label: 'Updates', path: '/news' },
                  ]
              ).map((item) => (
                <li key={`${item.label}-${item.path}`}>
                  <NavLink className="text-slate-700 hover:text-brand-goldText" to={item.path}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-extrabold text-brand-goldText">Visit</p>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink className="text-slate-700 hover:text-brand-goldText" to="/events">
                  Events
                </NavLink>
              </li>
              <li>
                <NavLink className="text-slate-700 hover:text-brand-goldText" to="/gallery">
                  Gallery
                </NavLink>
              </li>
              <li>
                <NavLink className="text-slate-700 hover:text-brand-goldText" to="/contact#visit">
                  Book a Visit
                </NavLink>
              </li>
              <li>
                <NavLink className="text-slate-700 hover:text-brand-goldText" to="/contact">
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-extrabold text-brand-goldText">Contact</p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
                <span>
                  {contact.address || 'Bukidnon, Philippines'}
                  <span className="block text-xs text-slate-500">(Update with your campus address)</span>
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
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-extrabold text-brand-goldText">Hours</p>
            <p className="text-sm text-slate-700">{contact.office_hours || 'Mon-Fri, 8:00 AM - 5:00 PM'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/60 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 text-[11px] text-slate-400">
          <span>{`© ${new Date().getFullYear()} ${footerSettings.copyrightText || 'Divine Mercy School of Bukidnon, Inc. All rights reserved.'}`}</span>
          <span className="font-semibold text-brand-goldText">{footerSettings.developerCredit || LOCKED_DEVELOPER_CREDIT}</span>
        </div>
      </div>
    </footer>
  )
}

