/**
 * useFloatParallax — Adds a gentle floating animation to an element
 * based on how far it is from the center of the viewport.
 * Returns { ref, style } — attach ref to the element, spread style on it.
 * Options: factor (0–1 intensity), max (px clamp)
 */
import { useEffect, useRef, useState } from 'react'

export default function useFloatParallax({ factor = 0.15, max = 14 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  useEffect(() => {
    if (!ref.current || prefersReduced) return undefined

    const el = ref.current
    let frame = null

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(entry.isIntersecting)
          if (entry.isIntersecting && frame === null) frame = requestAnimationFrame(update)
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(el)

    const update = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight || 1
      const centerDelta = rect.top + rect.height * 0.5 - viewportH * 0.5
      const offset = Math.max(-max, Math.min(max, centerDelta * factor))
      el.style.setProperty('--float-parallax', `${offset}px`)
      frame = null
    }

    const onScroll = () => {
      if (!visible || frame !== null) return
      frame = requestAnimationFrame(update)
    }

    const onResize = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [factor, max, prefersReduced, visible])

  const style = prefersReduced
    ? undefined
    : { transform: 'translate3d(0, var(--float-parallax, 0px), 0)', transition: 'transform 180ms ease-out' }

  return { ref, style }
}
