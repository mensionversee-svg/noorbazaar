import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthValue {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthValue>({ user: null, isAdmin: false, loading: true, signOut: async () => {} })
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async (u: User | null) => {
      setUser(u)
      if (u) {
        const { data } = await supabase.from('user_roles').select('role').eq('user_id', u.id).eq('role', 'admin').maybeSingle()
        setIsAdmin(!!data)
      } else setIsAdmin(false)
      setLoading(false)
    }
    supabase.auth.getUser().then(({ data }) => check(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setTimeout(() => void check(session?.user ?? null), 0)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <AuthCtx.Provider value={{ user, isAdmin, loading, signOut: async () => { await supabase.auth.signOut() } }}>
      {children}
    </AuthCtx.Provider>
  )
}
