import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!cancelled) setSession(data.session)
      } catch (err) {
        console.error('[Supabase] getSession failed', err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      cancelled = true
      listener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      if (!session?.user?.id) {
        setProfile(null)
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, full_name, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle()
        if (error) throw error
        if (!cancelled) setProfile(data || { id: session.user.id, role: 'editor' })
      } catch (err) {
        if (!cancelled) {
          console.warn('[Supabase] profiles fetch failed, using default role', err.message)
          setProfile({ id: session.user.id, role: 'editor' })
        }
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [session])

  const value = useMemo(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading,
      signIn: (params) => supabase.auth.signInWithPassword(params),
      signOut: () => supabase.auth.signOut(),
      signUp: (params) => supabase.auth.signUp(params),
    }),
    [session, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

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
      <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
