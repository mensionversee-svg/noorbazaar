import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { lovable } from '@/integrations/lovable'
import { useAuth } from '@/lib/auth'
import { store } from '@/config/store'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: `Sign in — ${store.name}` },
      { name: 'description', content: `Sign in or create your ${store.name} account to track orders and write reviews.` },
      { property: 'og:title', content: `Sign in — ${store.name}` },
      { property: 'og:description', content: 'Sign in with Google or email.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
})

export const inputCls = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10'

function AuthPage() {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate({ to: '/account', replace: true })
  }, [user, isAdmin, loading, navigate])

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth` })
    if (res.error) toast.error('Google login nahi ho saka. Dobara koshish karein.')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    if (mode === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error(error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name } },
      })
      if (error) toast.error(error.message)
      else toast.success('Account ban gaya! Apni email check karein aur confirm link par click karein.')
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
        <h1 className="font-display text-3xl font-semibold text-emerald-950">{mode === 'in' ? 'Welcome back' : 'Create account'}</h1>
        <p className="mt-1 text-sm text-muted">{mode === 'in' ? 'Sign in to track orders and write reviews.' : 'Join to shop faster and track your orders.'}</p>

        <button type="button" onClick={google} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 font-semibold hover:bg-sand">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h6a5.1 5.1 0 01-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.7 14a6.6 6.6 0 010-4.2V7H2a11 11 0 000 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 002 7l3.7 2.9C6.6 7.3 9.1 5.4 12 5.4z"/></svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'up' && <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} maxLength={80} />}
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          <input required type="password" minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          <button disabled={busy} className="w-full rounded-full bg-emerald-900 py-3 font-semibold text-ivory hover:bg-emerald-800 disabled:opacity-60">
            {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {mode === 'in' ? 'New here?' : 'Already have an account?'}{' '}
          <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="font-semibold text-emerald-800 hover:underline">
            {mode === 'in' ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
