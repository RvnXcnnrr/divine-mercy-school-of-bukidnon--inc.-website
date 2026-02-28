/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { supabase } from '../lib/supabaseClient.js'
import useInactivityLogout from '../hooks/useInactivityLogout.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const initSessionCheckedRef = useRef(false)
  const initHadSessionRef = useRef(false)

  const applySession = useCallback((nextSession) => {
    setSession(nextSession)
    if (!nextSession?.user?.id) {
      setProfile(null)
      return
    }

    setProfile((current) => {
      if (current?.id === nextSession.user.id) return current
      return { id: nextSession.user.id, role: 'editor' }
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (cancelled) return

        const restoredSession = data?.session ?? null
        initSessionCheckedRef.current = true
        initHadSessionRef.current = Boolean(restoredSession?.user?.id)
        applySession(restoredSession)
        setIsAuthReady(true)
      } catch (err) {
        console.error('[Supabase] getSession failed', err.message)
        if (cancelled) return

        initSessionCheckedRef.current = true
        initHadSessionRef.current = false
        applySession(null)
        setIsAuthReady(true)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Ignore transient null auth events before initial getSession finishes.
      if (!initSessionCheckedRef.current && !nextSession) return
      // Guard against contradictory initial null event right after getSession found a session.
      if (event === 'INITIAL_SESSION' && !nextSession && initHadSessionRef.current) return

      if (!initSessionCheckedRef.current) {
        initSessionCheckedRef.current = true
        initHadSessionRef.current = Boolean(nextSession?.user?.id)
      }

      applySession(nextSession)
      setIsAuthReady(true)
    })

    return () => {
      cancelled = true
      listener?.subscription?.unsubscribe()
    }
  }, [applySession])

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const userId = session?.user?.id
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, full_name, avatar_url')
          .eq('id', userId)
          .maybeSingle()
        if (error) throw error

        if (!cancelled) setProfile(data || { id: userId, role: 'editor' })
      } catch (err) {
        if (!cancelled) {
          console.warn('[Supabase] profiles fetch failed, using default role', err.message)
          setProfile({ id: userId, role: 'editor' })
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (!isAuthReady) return undefined
    let cancelled = false

    async function refreshSessionSilently() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (cancelled) return

        const nextSession = data?.session ?? null
        setSession((currentSession) => {
          const currentToken = currentSession?.access_token ?? null
          const nextToken = nextSession?.access_token ?? null
          const currentUserId = currentSession?.user?.id ?? null
          const nextUserId = nextSession?.user?.id ?? null
          if (currentToken === nextToken && currentUserId === nextUserId) return currentSession
          return nextSession
        })

        if (!nextSession?.user?.id) {
          setProfile(null)
          return
        }

        setProfile((currentProfile) => {
          if (currentProfile?.id === nextSession.user.id) return currentProfile
          return { id: nextSession.user.id, role: 'editor' }
        })
      } catch (err) {
        console.warn('[Supabase] silent session refresh failed', err.message)
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void refreshSessionSilently()
      }
    }

    function onFocus() {
      void refreshSessionSilently()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isAuthReady])

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  useInactivityLogout({
    enabled: Boolean(session?.user?.id) && isAuthReady,
    timeoutMs: 10 * 60 * 1000,
    onTimeout: () => {
      void signOut()
    },
  })

  const value = useMemo(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      isAuthReady,
      loading: !isAuthReady,
      signIn: (params) => supabase.auth.signInWithPassword(params),
      signOut,
      signUp: (params) => supabase.auth.signUp(params),
    }),
    [session, profile, isAuthReady, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const SupabaseAuthProvider = AuthProvider

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within SupabaseAuthProvider')
  return ctx
}

export function AppProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
