import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { formatPKR } from '@/lib/format'
import { orderRef, orderStatuses, statusColor, statusLabel } from '@/lib/orders'
import type { OrderItem } from '@/lib/orders'
import { store } from '@/config/store'

export const Route = createFileRoute('/_authenticated/admin')({
  component: Admin,
  head: () => ({ meta: [{ title: `Admin panel — ${store.name}` }, { name: 'robots', content: 'noindex' }] }),
})

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = 'orders' | 'products' | 'reviews'
const cell = 'w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm'

function Admin() {
  const { isAdmin, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('orders')
  if (loading) return <p className="p-10 text-center text-muted">Loading…</p>
  if (!isAdmin)
    return (
      <div className="p-10 text-center">
        <p className="text-muted">Ye page sirf admin ke liye hai.</p>
        <Link to="/" className="mt-4 inline-block underline">Home</Link>
      </div>
    )
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold text-emerald-950">Admin panel</h1>
      <div className="mt-6 flex gap-2">
        {(['orders', 'products', 'reviews'] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${tab === t ? 'bg-emerald-900 text-ivory' : 'border border-line'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">{tab === 'orders' ? <Orders /> : tab === 'products' ? <Products /> : <Reviews />}</div>
    </div>
  )
}

function Orders() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const load = useCallback(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []))
  }, [])
  useEffect(load, [load])
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Status updated'); load() }
  }
  if (!rows) return <p className="text-muted">Loading…</p>
  if (!rows.length) return <p className="text-muted">Abhi koi order nahi.</p>
  return (
    <ul className="space-y-3">
      {rows.map((o) => (
        <li key={o.id} className="rounded-2xl border border-line bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{orderRef(o)} · {o.customer_name} · {o.phone}</p>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status] ?? ''}`}>{statusLabel[o.status] ?? o.status}</span>
              <select aria-label="Change status" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-lg border border-line px-2 py-1 text-sm">
                {orderStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
              </select>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted">{o.address}, {o.city} · {new Date(o.created_at).toLocaleString('en-PK')}</p>
          <p className="mt-1 text-sm">{(o.items as Array<OrderItem>).map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
          {o.notes && <p className="mt-1 text-sm italic text-muted">{o.notes}</p>}
          <p className="mt-1 font-bold">{formatPKR(o.total)}</p>
        </li>
      ))}
    </ul>
  )
}

function Products() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: 'women', image: '' })
  const load = useCallback(() => {
    supabase.from('products').select('*').order('id').then(({ data }) => setRows(data ?? []))
  }, [])
  useEffect(load, [load])

  const save = async (r: any) => {
    const { error } = await supabase.from('products').update({ name: r.name, price: Number(r.price), stock: Number(r.stock), compare_at: r.compare_at ? Number(r.compare_at) : null, image: r.image }).eq('id', r.id)
    if (error) toast.error(error.message); else toast.success('Saved')
  }
  const remove = async (id: number) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error(error.message); else load()
  }
  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)
    const { error } = await supabase.from('products').insert({ slug, name: form.name.trim(), price: Number(form.price) || 0, stock: Number(form.stock) || 0, category: form.category, image: form.image })
    if (error) toast.error(error.message)
    else { toast.success('Product added'); setForm({ name: '', price: '', stock: '', category: 'women', image: '' }); load() }
  }
  const upd = (id: number, k: string, v: string) => setRows((rs) => rs!.map((r) => (r.id === id ? { ...r, [k]: v } : r)))

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="grid gap-2 rounded-2xl border border-line bg-white p-4 sm:grid-cols-6">
        <input className={`${cell} sm:col-span-2`} placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={cell} placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className={cell} placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className={cell} placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <button className="rounded-lg bg-emerald-900 px-3 py-1.5 text-sm font-semibold text-ivory">Add product</button>
      </form>
      {!rows ? <p className="text-muted">Loading…</p> : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="grid items-center gap-2 rounded-2xl border border-line bg-white p-3 sm:grid-cols-12">
              {r.image ? <img src={r.image} alt="" className="h-12 w-12 rounded-lg object-cover sm:col-span-1" /> : <div className="sm:col-span-1" />}
              <input aria-label="Name" className={`${cell} sm:col-span-4`} value={r.name} onChange={(e) => upd(r.id, 'name', e.target.value)} />
              <input aria-label="Price" type="number" className={`${cell} sm:col-span-2`} value={r.price} onChange={(e) => upd(r.id, 'price', e.target.value)} />
              <input aria-label="Compare at price" type="number" placeholder="Old price" className={`${cell} sm:col-span-2`} value={r.compare_at ?? ''} onChange={(e) => upd(r.id, 'compare_at', e.target.value)} />
              <input aria-label="Stock" type="number" className={`${cell} sm:col-span-1`} value={r.stock} onChange={(e) => upd(r.id, 'stock', e.target.value)} />
              <div className="flex gap-1 sm:col-span-2">
                <button type="button" onClick={() => save(r)} className="flex-1 rounded-lg bg-emerald-900 px-2 py-1.5 text-xs font-semibold text-ivory">Save</button>
                <button type="button" onClick={() => remove(r.id)} className="flex-1 rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-rose">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Reviews() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const load = useCallback(() => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []))
  }, [])
  useEffect(load, [load])
  const toggle = async (r: any) => {
    const { error } = await supabase.from('reviews').update({ hidden: !r.hidden }).eq('id', r.id)
    if (error) toast.error(error.message); else load()
  }
  const remove = async (id: string) => {
    if (!confirm('Delete review?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) toast.error(error.message); else load()
  }
  if (!rows) return <p className="text-muted">Loading…</p>
  if (!rows.length) return <p className="text-muted">Koi review nahi.</p>
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className={`rounded-2xl border border-line bg-white p-4 ${r.hidden ? 'opacity-60' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{r.author} · {'★'.repeat(r.rating)} {r.title}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggle(r)} className="rounded-lg border border-line px-3 py-1 text-xs font-semibold">{r.hidden ? 'Show' : 'Hide'}</button>
              <button type="button" onClick={() => remove(r.id)} className="rounded-lg border border-line px-3 py-1 text-xs font-semibold text-rose">Delete</button>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted">{r.body}</p>
        </li>
      ))}
    </ul>
  )
}
