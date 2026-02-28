import { useEffect, useRef } from 'react'

const DEFAULT_ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

export default function useInactivityLogout({
  enabled = true,
  timeoutMs,
  warningMs = 60 * 1000,
  events = DEFAULT_ACTIVITY_EVENTS,
  onWarning,
  onTimeout,
}) {
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const onWarningRef = useRef(onWarning)
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onWarningRef.current = onWarning
  }, [onWarning])

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    const hasValidTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0
    if (!enabled || !hasValidTimeout) return undefined

    const clearTimers = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      timeoutRef.current = null
      warningRef.current = null
    }

    const startTimers = () => {
      clearTimers()

      if (typeof onWarningRef.current === 'function' && timeoutMs > warningMs) {
        warningRef.current = setTimeout(() => {
          onWarningRef.current?.()
        }, timeoutMs - warningMs)
      }

      timeoutRef.current = setTimeout(() => {
        onTimeoutRef.current?.()
      }, timeoutMs)
    }

    const handleActivity = () => {
      startTimers()
    }

    startTimers()
    events.forEach((eventName) => window.addEventListener(eventName, handleActivity))

    return () => {
      clearTimers()
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity))
    }
  }, [enabled, timeoutMs, warningMs, events])
}
