import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa6'

export default function Footer() {
  const [logoOk, setLogoOk] = useState(true)

  return (
    <footer className="border-t border-slate-200 bg-brand-sky dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              {logoOk ? (
                <img
                  src="/logo.png"
                  alt="Divine Mercy School of Bukidnon, Inc. logo"
                  className="h-full w-full object-contain"
                  loading="lazy"
                  width="40"
                  height="40"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <span className="text-xs font-extrabold text-brand-navy" aria-hidden="true">
                  DMSB
                </span>
              )}
            </span>
            <p className="text-base font-extrabold text-brand-goldText">Divine Mercy School of Bukidnon, Inc.</p>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            A private Catholic school committed to faith-based education, discipline, and service.
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-goldText">We bring education closer to every child.</p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.facebook.com/dmsb"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-goldText shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-brand-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
              aria-label="Facebook"
            >
              <FaFacebookF className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.youtube.com/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-goldText shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-brand-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
              aria-label="YouTube"
            >
              <FaYoutube className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.instagram.com/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-goldText shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-brand-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
              aria-label="Instagram"
            >
              <FaInstagram className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold text-brand-goldText">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <NavLink className="text-slate-700 hover:text-brand-goldText dark:text-slate-200" to="/about">
                About
              </NavLink>
            </li>
            <li>
              <NavLink className="text-slate-700 hover:text-brand-goldText dark:text-slate-200" to="/academics">
                Academics
              </NavLink>
            </li>
            <li>
              <NavLink className="text-slate-700 hover:text-brand-goldText dark:text-slate-200" to="/admissions">
                Admissions
              </NavLink>
            </li>
            <li>
              <NavLink className="text-slate-700 hover:text-brand-goldText dark:text-slate-200" to="/news">
                News & Events
              </NavLink>
            </li>
            <li>
              <NavLink className="text-slate-700 hover:text-brand-goldText dark:text-slate-200" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-extrabold text-brand-goldText">Contact</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <li className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 h-4 w-4 text-brand-blue" aria-hidden="true" />
              <span>
                Bukidnon, Philippines
                <span className="block text-xs text-slate-500 dark:text-slate-400">(Update with your exact campus address)</span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="h-4 w-4 text-brand-blue" aria-hidden="true" />
              <a className="hover:text-brand-goldText" href="tel:+630000000000">
                +63 000 000 0000
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FiMail className="h-4 w-4 text-brand-blue" aria-hidden="true" />
              <a className="hover:text-brand-goldText" href="mailto:info@dmsb.example">
                info@dmsb.example
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-extrabold text-brand-goldText">Office Hours</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
            Monday – Friday
            <span className="block text-slate-500 dark:text-slate-400">8:00 AM – 5:00 PM</span>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Divine Mercy School of Bukidnon, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
