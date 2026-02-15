import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Academics from './pages/Academics.jsx'
import Admissions from './pages/Admissions.jsx'
import News from './pages/News.jsx'
import Contact from './pages/Contact.jsx'
import Vlogs from './pages/Vlogs.jsx'
import Events from './pages/Events.jsx'
import Gallery from './pages/Gallery.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminPosts from './pages/admin/AdminPosts.jsx'
import AdminPostEditor from './pages/admin/AdminPostEditor.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
import AdminSiteContent from './pages/admin/AdminSiteContent.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (prefersReduced?.matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12 }
    )

    const revealables = document.querySelectorAll('[data-reveal]:not(.is-visible)')
    revealables.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [pathname])

  return (
    <div className="min-h-dvh bg-brand-sky text-brand-ink dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-brand-ink focus:shadow"
      >
        Skip to content
      </a>
      <Navbar />
      <ScrollToTop />

      <main id="content" className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/news" element={<News />} />
          <Route path="/vlogs" element={<Vlogs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute roles={['admin', 'editor']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="posts/new" element={<AdminPostEditor />} />
              <Route path="posts/:postId" element={<AdminPostEditor />} />
              <Route path="content" element={<AdminSiteContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
