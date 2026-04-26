import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/app.types'

interface AuthState {
  session: Session | null
  role: Role | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [ready, setReady] = useState(false)

  const fetchRole = useCallback(async (userId: string): Promise<Role | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (error || !data) return null
    return data.role as Role
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      const {
        data: { session: current },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (current) {
        const r = await fetchRole(current.user.id)
        if (!mounted) return
        setSession(current)
        setRole(r)
      }

      setReady(true)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Two-step pattern: NEVER call getUser() inside this listener.
      setSession(newSession)

      if (!newSession) {
        setRole(null)
        return
      }

      fetchRole(newSession.user.id).then((r) => {
        if (mounted) setRole(r)
      })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchRole])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, role, ready, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
