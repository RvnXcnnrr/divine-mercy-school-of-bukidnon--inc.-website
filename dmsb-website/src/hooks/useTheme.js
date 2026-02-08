import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'dmsb-theme'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

function readPreference() {
  if (typeof window === 'undefined') return 'system'
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function writePreference(next) {
  try {
    if (next === 'system') {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  } catch {
    // ignore
  }
}

function applyResolvedTheme(resolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.style.colorScheme = resolvedTheme
}

export default function useTheme() {
  const [preference, setPreference] = useState(() => readPreference())
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme())

  const resolvedTheme = useMemo(() => {
    return preference === 'system' ? systemTheme : preference
  }, [preference, systemTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    function onChange() {
      setSystemTheme(media.matches ? 'dark' : 'light')
    }

    onChange()
    if (media.addEventListener) media.addEventListener('change', onChange)
    else media.addListener(onChange)

    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange)
      else media.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    function onStorage(e) {
      if (e.key !== STORAGE_KEY) return
      setPreference(readPreference())
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback((nextPreference) => {
    setPreference(nextPreference)
    if (typeof window !== 'undefined') writePreference(nextPreference)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return {
    theme: preference,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }
}
