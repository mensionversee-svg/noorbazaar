import { useState } from 'react'
import { z } from 'zod'

const emailSchema = z.string().email()

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailSchema.safeParse(email.trim()).success) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setStatus('sending')
    // TODO: connect to an email service when a backend is added.
    await new Promise((r) => setTimeout(r, 600))
    setStatus('done')
  }

  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6" aria-labelledby="newsletter-title">
      <div className="relative overflow-hidden rounded-3xl bg-emerald-900 px-6 py-14 text-center text-ivory md:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-saffron/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-emerald-700/60 blur-3xl" />
        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">Join the Noor circle</p>
          <h2 id="newsletter-title" className="font-display text-3xl font-semibold md:text-4xl">Offers worth opening</h2>
          <p className="mx-auto mt-3 max-w-lg text-ivory/75">Be first to hear about new drops, Eid collections and subscriber-only flash sales. No spam — unsubscribe anytime.</p>
          {status === 'done' ? (
            <p className="mx-auto mt-8 max-w-md rounded-full bg-ivory/10 px-6 py-4 font-semibold text-saffron-light" role="status">
              Shukriya! You’re subscribed — check your inbox soon.
            </p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
              <input type="hidden" name="form-name" value="newsletter" />
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={120}
                className="min-w-0 flex-1 rounded-full border border-ivory/20 bg-ivory/10 px-5 py-3.5 text-ivory outline-none placeholder:text-ivory/50 focus:border-saffron"
              />
              <button type="submit" disabled={status === 'sending'} className="rounded-full bg-saffron px-7 py-3.5 font-semibold text-emerald-950 transition hover:bg-saffron-light disabled:opacity-60">
                {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          )}
          {error && <p className="mt-3 text-sm text-saffron-light" role="alert">{error}</p>}
        </div>
      </div>
    </section>
  )
}
