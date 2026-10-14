import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LogOut, Package, Shield } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { formatPKR } from '@/lib/format'
import { orderRef, statusColor, statusLabel } from '@/lib/orders'
import type { OrderItem } from '@/lib/orders'
import { store } from '@/config/store'

export const Route = createFileRoute('/_authenticated/account')({
  component: Account,
  head: () => ({ meta: [{ title: `My account — ${store.name}` }, { name: 'robots', content: 'noindex' }] }),
})

interface Row { id: string; order_number: number; created_at: string; status: string; total: number; items: unknown }

function Account() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Array<Row> | null>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('orders').select('id, order_number, created_at, status, total, items').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as Array<Row>) ?? []))
  }, [user])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-emerald-950">My account</h1>
          <p className="mt-1 text-sm text-muted">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-ivory">
              <Shield size={16} /> Admin panel
            </Link>
          )}
          <button type="button" onClick={async () => { await signOut(); navigate({ to: '/auth', replace: true }) }} className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-sand">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-display text-2xl font-semibold">My orders</h2>
      {orders === null ? <p className="text-muted">Loading…</p> : orders.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white p-10 text-center">
          <Package className="mx-auto text-muted" size={36} />
          <p className="mt-3 text-muted">Abhi koi order nahi.</p>
          <Link to="/shop" className="mt-5 inline-block rounded-full bg-emerald-900 px-6 py-3 font-semibold text-ivory">Start shopping</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">Order {orderRef(o)} <span className="ml-2 text-sm font-normal text-muted">{new Date(o.created_at).toLocaleDateString('en-PK')}</span></p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status] ?? ''}`}>{statusLabel[o.status] ?? o.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{(o.items as Array<OrderItem>).map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
              <p className="mt-2 font-bold">{formatPKR(o.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
