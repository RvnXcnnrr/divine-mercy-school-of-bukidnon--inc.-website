import { useEffect, useRef } from 'react'

/**
 * Lightweight parallax helper that writes a CSS variable `--parallax-y`
 * onto the attached element based on the page scroll position.
 * Use per-layer multipliers in inline styles to create depth.
 */
export default function useParallax({ factorY = 0.12, factorX = 0.05 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    let frame = null
    let prefersReduced = false

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced = media.matches
    const handleMedia = (e) => {
      prefersReduced = e.matches
      update()
    }
    media.addEventListener('change', handleMedia)

    const update = () => {
      if (!ref.current) {
        frame = null
        return
      }
      const effectiveFactorY = prefersReduced ? 0 : factorY
      const effectiveFactorX = prefersReduced ? 0 : factorX
      const y = window.scrollY * effectiveFactorY
      const x = window.scrollY * effectiveFactorX
      ref.current.style.setProperty('--parallax-y', `${y}px`)
      ref.current.style.setProperty('--parallax-x', `${x}px`)
      ref.current.style.setProperty('--parallax-bg', `${y * 0.35}px`)
      frame = null
    }

    const onScroll = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      media.removeEventListener('change', handleMedia)
    }
  }, [factorY, factorX])

  return ref
}
