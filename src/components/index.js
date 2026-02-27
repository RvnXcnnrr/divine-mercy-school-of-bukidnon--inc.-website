/**
 * Barrel export for all shared UI components.
 * Import from here instead of individual file paths:
 *   import { Navbar, Footer, LoadingOverlay } from '../components'
 */

// ── Layout ────────────────────────────────────────────
export { default as Navbar }         from './Navbar.jsx'
export { default as Footer }         from './Footer.jsx'
export { default as Hero }           from './Hero.jsx'
export { default as WaveDivider }    from './WaveDivider.jsx'

// ── Cards ─────────────────────────────────────────────
export { default as BoardMemberCard } from './BoardMemberCard.jsx'
export { default as EventCard }      from './EventCard.jsx'
export { default as NewsCard }       from './NewsCard.jsx'
export { default as SectionCard }    from './SectionCard.jsx'
export { default as Testimonial }    from './Testimonial.jsx'

// ── UI / Modals ───────────────────────────────────────
export { default as AdminLoginModal } from './AdminLoginModal.jsx'
export { default as ConfirmModal }   from './ConfirmModal.jsx'
export { default as LoadingOverlay } from './LoadingOverlay.jsx'
