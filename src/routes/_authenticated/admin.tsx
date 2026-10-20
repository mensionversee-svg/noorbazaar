import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'
import { formatPKR } from '@/lib/format'
import { orderRef, orderStatuses, statusColor, statusLabel } from '@/lib/orders'
import type { OrderItem } from '@/lib/orders'
import { store } from '@/config/store'
import { categories } from '@/data/catalog'
import { useServerFn } from '@tanstack/react-start'
import { draftWhatsAppReply } from '@/lib/ai-reply.functions'
import { ProductExport } from '@/components/admin/ProductExport'

export const Route = createFileRoute('/_authenticated/admin')({
  component: Admin,
  head: () => ({ meta: [{ title: `Admin panel — ${store.name}` }, { name: 'description', content: 'Manage Noor Bazaar products, orders and catalog exports.' }, { property: 'og:title', content: `Admin panel — ${store.name}` }, { property: 'og:description', content: 'Manage Noor Bazaar products, orders and catalog exports.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
})

/* eslint-disable @typescript-eslint/no-explicit-any */
const TABS = ['dashboard', 'orders', 'ai reply', 'products', 'export products', 'customers', 'reviews', 'settings'] as const
type Tab = (typeof TABS)[number]
const cell = 'w-full rounded-lg border border-line bg-white px-2 py-1.5 text-sm'
const btn = 'rounded-lg bg-emerald-900 px-3 py-1.5 text-sm font-semibold text-ivory disabled:opacity-50'
const btnOutline = 'rounded-lg border border-line px-3 py-1.5 text-sm font-semibold'

function Admin() {
  const { isAdmin, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('dashboard')
  if (loading) return <p className="p-10 text-center text-muted">Loading…</p>
  if (!isAdmin)
    return (
      <div className="p-10 text-center">
        <p className="text-muted">Ye page sirf admin ke liye hai.</p>
        <Link to="/" className="mt-4 inline-block underline">Home</Link>
      </div>
    )
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-emerald-950 sm:text-4xl">Admin panel</h1>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === t ? 'bg-emerald-900 text-ivory' : 'border border-line'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'dashboard' && <Dashboard go={setTab} />}
        {tab === 'orders' && <Orders />}
        {tab === 'ai reply' && <AiReply />}
        {tab === 'products' && <Products />}
        {tab === 'export products' && <ProductExport />}
        {tab === 'customers' && <Customers />}
        {tab === 'reviews' && <Reviews />}
        {tab === 'settings' && <Settings />}
      </div>
    </div>
  )
}

function Stat({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-line bg-white p-4 text-left">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-emerald-950">{value}</p>
    </button>
  )
}

function Dashboard({ go }: { go: (t: Tab) => void }) {
  const [d, setD] = useState<any>(null)
  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('id,total,status,created_at,customer_name,order_number').order('created_at', { ascending: false }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).lte('stock', 5),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]).then(([o, p, low, c]) => setD({ orders: o.data ?? [], products: p.count ?? 0, low: low.count ?? 0, customers: c.count ?? 0 }))
  }, [])
  if (!d) return <p className="text-muted">Loading…</p>
  const active = d.orders.filter((o: any) => o.status !== 'cancelled')
  const revenue = active.reduce((s: number, o: any) => s + o.total, 0)
  const pending = d.orders.filter((o: any) => o.status === 'pending').length
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total orders" value={d.orders.length} onClick={() => go('orders')} />
        <Stat label="Pending" value={pending} onClick={() => go('orders')} />
        <Stat label="Revenue" value={formatPKR(revenue)} />
        <Stat label="Products" value={d.products} onClick={() => go('products')} />
        <Stat label="Low stock (≤5)" value={d.low} onClick={() => go('products')} />
        <Stat label="Customers" value={d.customers} onClick={() => go('customers')} />
      </div>
      <div className="rounded-2xl border border-line bg-white p-4">
        <h2 className="font-semibold">Latest orders</h2>
        {d.orders.length === 0 ? <p className="mt-2 text-sm text-muted">Abhi koi order nahi.</p> : (
          <ul className="mt-2 divide-y divide-line text-sm">
            {d.orders.slice(0, 8).map((o: any) => (
              <li key={o.id} className="flex justify-between gap-2 py-2">
                <span>{orderRef(o)} · {o.customer_name}</span>
                <span className="font-semibold">{formatPKR(o.total)} · {statusLabel[o.status] ?? o.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Orders() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatusFilter] = useState('all')
  const load = useCallback(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []))
  }, [])
  useEffect(load, [load])
  const setStatus = async (id: string, s: string) => {
    const { error } = await supabase.from('orders').update({ status: s }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Status updated'); load() }
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this order?')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) toast.error(error.message); else load()
  }
  const list = useMemo(() => (rows ?? []).filter((o) => (status === 'all' || o.status === status) && `${o.customer_name} ${o.phone} ${o.whatsapp ?? ''} ${o.city} ${orderRef(o)}`.toLowerCase().includes(q.toLowerCase())), [rows, q, status])
  const waLink = (n: string) => `https://wa.me/${n.replace(/\D/g, '').replace(/^0/, '92')}`
  if (!rows) return <p className="text-muted">Loading…</p>
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input className={`${cell} max-w-xs`} placeholder="Search name, phone, city…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${cell} w-auto`} value={status} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter status">
          <option value="all">All statuses</option>
          {orderStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
      </div>
      {!list.length ? <p className="text-muted">Koi order nahi mila.</p> : (
        <ul className="space-y-3">
          {list.map((o) => (
            <li key={o.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{orderRef(o)} · {o.customer_name}</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status] ?? ''}`}>{statusLabel[o.status] ?? o.status}</span>
                  <select aria-label="Change status" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-lg border border-line px-2 py-1 text-sm">
                    {orderStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                </div>
              </div>
              <p className="mt-1 text-sm">
                <a href={`tel:${o.phone}`} className="underline">{o.phone}</a>
                {o.whatsapp && <> · <a href={waLink(o.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-800 underline">WhatsApp {o.whatsapp}</a></>}
                {o.email && <> · {o.email}</>}
              </p>
              <p className="mt-1 text-sm text-muted">{o.address}, {o.city} · {new Date(o.created_at).toLocaleString('en-PK')}</p>
              <p className="mt-1 text-sm">{(o.items as Array<OrderItem>).map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
              {o.notes && <p className="mt-1 text-sm italic text-muted">{o.notes}</p>}
              <div className="mt-2 flex items-center justify-between">
                <p className="font-bold">{formatPKR(o.total)} <span className="text-xs font-normal text-muted">({o.payment_method}{o.coupon ? ` · ${o.coupon}` : ''})</span></p>
                <button type="button" onClick={() => remove(o.id)} className="text-xs font-semibold text-rose">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const emptyProduct = { name: '', price: '', compare_at: '', stock: '', category: 'women', subcategory: '', image: '', images: '', short_description: '', description: '', featured: false }

function ProductForm({ initial, onDone, onCancel }: { initial?: any; onDone: () => void; onCancel: () => void }) {
  const [f, setF] = useState<any>(() => initial ? { ...initial, compare_at: initial.compare_at ?? '', images: (initial.images ?? []).join('\n') } : emptyProduct)
  const [busy, setBusy] = useState(false)
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const cat = categories.find((c) => c.slug === f.category)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim()) { toast.error('Name likhein'); return }
    const images = String(f.images).split(/\s+/).filter((u) => u.startsWith('http') || u.startsWith('/'))
    const payload = {
      name: f.name.trim(), price: Number(f.price) || 0, compare_at: f.compare_at ? Number(f.compare_at) : null, stock: Number(f.stock) || 0,
      category: f.category, subcategory: f.subcategory, image: f.image || images[0] || '', images,
      short_description: f.short_description, description: f.description, featured: !!f.featured,
    }
    setBusy(true)
    const { error } = initial
      ? await supabase.from('products').update(payload).eq('id', initial.id)
      : await supabase.from('products').insert({ ...payload, slug: f.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36) })
    setBusy(false)
    if (error) toast.error(error.message); else { toast.success(initial ? 'Saved' : 'Product added'); onDone() }
  }
  return (
    <form onSubmit={submit} className="grid gap-2 rounded-2xl border border-line bg-white p-4 sm:grid-cols-4">
      <input className={`${cell} sm:col-span-4`} placeholder="Product name" value={f.name} onChange={set('name')} />
      <input className={cell} type="number" placeholder="Price" value={f.price} onChange={set('price')} />
      <input className={cell} type="number" placeholder="Old price (optional)" value={f.compare_at} onChange={set('compare_at')} />
      <input className={cell} type="number" placeholder="Stock" value={f.stock} onChange={set('stock')} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.featured} onChange={set('featured')} /> Featured</label>
      <select className={`${cell} sm:col-span-2`} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, subcategory: '' })} aria-label="Category">
        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <select className={`${cell} sm:col-span-2`} value={f.subcategory} onChange={set('subcategory')} aria-label="Subcategory">
        <option value="">— Subcategory —</option>
        {cat?.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
      </select>
      <input className={`${cell} sm:col-span-4`} placeholder="Main image URL" value={f.image} onChange={set('image')} />
      <textarea className={`${cell} sm:col-span-4`} rows={2} placeholder="More image URLs (one per line)" value={f.images} onChange={set('images')} />
      <textarea className={`${cell} sm:col-span-4`} rows={2} placeholder="Short description" value={f.short_description} onChange={set('short_description')} />
      <textarea className={`${cell} sm:col-span-4`} rows={4} placeholder="Full description" value={f.description} onChange={set('description')} />
      <div className="flex gap-2 sm:col-span-4">
        <button disabled={busy} className={btn}>{initial ? 'Save changes' : 'Add product'}</button>
        <button type="button" onClick={onCancel} className={btnOutline}>Cancel</button>
      </div>
    </form>
  )
}

function Products() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const [q, setQ] = useState('')
  const [catF, setCatF] = useState('all')
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<any | 'new' | null>(null)
  const load = useCallback(() => {
    ;(async () => {
      const all: Array<any> = []
      for (let from = 0; ; from += 1000) {
        const { data } = await supabase.from('products').select('*').order('id', { ascending: false }).range(from, from + 999)
        if (!data) break
        all.push(...data)
        if (data.length < 1000) break
      }
      setRows(all)
    })()
  }, [])
  useEffect(load, [load])
  const list = useMemo(() => (rows ?? []).filter((r) => (catF === 'all' || r.category === catF) && r.name.toLowerCase().includes(q.toLowerCase())), [rows, q, catF])
  const PER = 25
  const pages = Math.max(1, Math.ceil(list.length / PER))
  const quick = async (r: any, patch: any) => {
    const { error } = await supabase.from('products').update(patch).eq('id', r.id)
    if (error) toast.error(error.message); else { toast.success('Saved'); load() }
  }
  const remove = async (id: number) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error(error.message); else load()
  }
  if (editing) return <ProductForm initial={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); load() }} />
  if (!rows) return <p className="text-muted">Loading…</p>
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setEditing('new')} className={btn}>+ Add product</button>
        <input className={`${cell} max-w-xs`} placeholder="Search products…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} />
        <select className={`${cell} w-auto`} value={catF} onChange={(e) => { setCatF(e.target.value); setPage(0) }} aria-label="Filter category">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <span className="self-center text-sm text-muted">{list.length} products</span>
      </div>
      <ul className="space-y-2">
        {list.slice(page * PER, page * PER + PER).map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3">
            {r.image ? <img src={r.image} alt="" className="h-14 w-14 rounded-lg object-cover" loading="lazy" /> : <div className="h-14 w-14 rounded-lg bg-sand" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{r.name} {r.featured && <span className="text-xs text-emerald-800">★ Featured</span>}</p>
              <p className="text-sm text-muted">{formatPKR(r.price)} · Stock {r.stock} · {categories.find((c) => c.slug === r.category)?.name ?? r.category}</p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => quick(r, { featured: !r.featured })} className={btnOutline}>{r.featured ? 'Unfeature' : 'Feature'}</button>
              <button type="button" onClick={() => setEditing(r)} className={btn}>Edit</button>
              <button type="button" onClick={() => remove(r.id)} className={`${btnOutline} text-rose`}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className={btnOutline}>Prev</button>
          <span className="text-sm">{page + 1} / {pages}</span>
          <button type="button" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className={btnOutline}>Next</button>
        </div>
      )}
    </div>
  )
}

function Customers() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const [orders, setOrders] = useState<Array<any>>([])
  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []))
    supabase.from('orders').select('user_id,total').then(({ data }) => setOrders(data ?? []))
  }, [])
  if (!rows) return <p className="text-muted">Loading…</p>
  if (!rows.length) return <p className="text-muted">Abhi koi customer account nahi.</p>
  return (
    <ul className="space-y-2">
      {rows.map((c) => {
        const mine = orders.filter((o) => o.user_id === c.id)
        return (
          <li key={c.id} className="flex flex-wrap justify-between gap-2 rounded-2xl border border-line bg-white p-4 text-sm">
            <div>
              <p className="font-semibold">{c.full_name || '—'}</p>
              <p className="text-muted">{c.email} · joined {new Date(c.created_at).toLocaleDateString('en-PK')}</p>
            </div>
            <p className="self-center font-semibold">{mine.length} orders · {formatPKR(mine.reduce((s, o) => s + o.total, 0))}</p>
          </li>
        )
      })}
    </ul>
  )
}

function Reviews() {
  const [rows, setRows] = useState<Array<any> | null>(null)
  const load = useCallback(() => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []))
  }, [])
  useEffect(load, [load])
  const update = async (r: any, patch: any) => {
    const { error } = await supabase.from('reviews').update(patch).eq('id', r.id)
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
              <button type="button" onClick={() => update(r, { verified: !r.verified })} className="rounded-lg border border-line px-3 py-1 text-xs font-semibold">{r.verified ? 'Unverify' : 'Verify'}</button>
              <button type="button" onClick={() => update(r, { hidden: !r.hidden })} className="rounded-lg border border-line px-3 py-1 text-xs font-semibold">{r.hidden ? 'Show' : 'Hide'}</button>
              <button type="button" onClick={() => remove(r.id)} className="rounded-lg border border-line px-3 py-1 text-xs font-semibold text-rose">Delete</button>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted">{r.body}</p>
        </li>
      ))}
    </ul>
  )
}

function Settings() {
  const [f, setF] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setF({
      name: store.name, tagline: store.tagline, whatsappNumber: store.whatsappNumber, phone: store.phone, email: store.email,
      address: store.address, hours: store.hours, freeThreshold: store.shipping.freeThreshold, standardFee: store.shipping.standardFee,
      announcements: store.announcements.join('\n'), heroTitle: store.hero.title, heroSubtitle: store.hero.subtitle, heroBadge: store.hero.badge,
      facebook: store.socials.facebook, instagram: store.socials.instagram, tiktok: store.socials.tiktok, youtube: store.socials.youtube,
    })
  }, [])
  if (!f) return null
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: f.name, tagline: f.tagline, whatsappNumber: String(f.whatsappNumber).replace(/\D/g, ''), phone: f.phone, email: f.email, address: f.address, hours: f.hours,
      shipping: { freeThreshold: Number(f.freeThreshold) || 0, standardFee: Number(f.standardFee) || 0 },
      announcements: String(f.announcements).split('\n').map((s) => s.trim()).filter(Boolean),
      hero: { title: f.heroTitle, subtitle: f.heroSubtitle, badge: f.heroBadge },
      socials: { facebook: f.facebook, instagram: f.instagram, tiktok: f.tiktok, youtube: f.youtube },
    }
    setBusy(true)
    const { error } = await supabase.from('site_settings').upsert({ id: 1, data, updated_at: new Date().toISOString() })
    setBusy(false)
    if (error) toast.error(error.message); else toast.success('Settings saved — page refresh karein')
  }
  const field = (k: string, label: string, type = 'text') => (
    <label className="text-sm">
      <span className="text-muted">{label}</span>
      <input type={type} className={cell} value={f[k]} onChange={set(k)} />
    </label>
  )
  return (
    <form onSubmit={save} className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2">
      {field('name', 'Store name')}
      {field('tagline', 'Tagline')}
      {field('whatsappNumber', 'WhatsApp number (e.g. 923001234567)')}
      {field('phone', 'Phone')}
      {field('email', 'Email')}
      {field('hours', 'Opening hours')}
      <label className="text-sm sm:col-span-2"><span className="text-muted">Address</span><input className={cell} value={f.address} onChange={set('address')} /></label>
      {field('freeThreshold', 'Free delivery above (Rs.)', 'number')}
      {field('standardFee', 'Delivery fee (Rs.)', 'number')}
      {field('heroBadge', 'Home banner badge')}
      {field('heroTitle', 'Home banner title')}
      <label className="text-sm sm:col-span-2"><span className="text-muted">Home banner subtitle</span><textarea rows={2} className={cell} value={f.heroSubtitle} onChange={set('heroSubtitle')} /></label>
      <label className="text-sm sm:col-span-2"><span className="text-muted">Announcement bar (one per line)</span><textarea rows={3} className={cell} value={f.announcements} onChange={set('announcements')} /></label>
      {field('facebook', 'Facebook link')}
      {field('instagram', 'Instagram link')}
      {field('tiktok', 'TikTok link')}
      {field('youtube', 'YouTube link')}
      <div className="sm:col-span-2"><button disabled={busy} className={btn}>Save settings</button></div>
    </form>
  )
}

function AiReply() {
  const draft = useServerFn(draftWhatsAppReply)
  const [orders, setOrders] = useState<Array<any>>([])
  const [orderId, setOrderId] = useState('')
  const [concern, setConcern] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    supabase.from('orders').select('id,order_number,customer_name,phone,whatsapp,total,status').order('created_at', { ascending: false }).limit(200).then(({ data }) => setOrders(data ?? []))
  }, [])
  const order = orders.find((o) => o.id === orderId)
  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !concern.trim()) { toast.error('Order aur concern dono chahiye'); return }
    setBusy(true)
    try {
      const r = await draft({ data: { orderId, concern } })
      if (r.error) toast.error(r.error); else setReply(r.reply)
    } catch { toast.error('AI reply abhi nahi ban saka.') }
    setBusy(false)
  }
  const num = (order?.whatsapp || order?.phone || '').replace(/\D/g, '').replace(/^0/, '92')
  return (
    <form onSubmit={run} className="space-y-3 rounded-2xl border border-line bg-white p-4">
      <h2 className="font-semibold">AI WhatsApp reply</h2>
      <p className="text-sm text-muted">Order chunein, customer ka masla likhein — AI ek reply draft karega.</p>
      <select aria-label="Order" className={cell} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
        <option value="">— Order chunein —</option>
        {orders.map((o) => <option key={o.id} value={o.id}>{orderRef(o)} · {o.customer_name} · {formatPKR(o.total)} · {statusLabel[o.status] ?? o.status}</option>)}
      </select>
      <textarea rows={4} maxLength={2000} className={cell} placeholder="Customer concern (e.g. Mera order kab tak aayega?)" value={concern} onChange={(e) => setConcern(e.target.value)} />
      <button disabled={busy} className={btn}>{busy ? 'Drafting…' : 'Draft reply'}</button>
      {reply && (
        <div className="space-y-2">
          <textarea rows={7} className={cell} value={reply} onChange={(e) => setReply(e.target.value)} aria-label="Draft reply" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnOutline} onClick={() => { navigator.clipboard.writeText(reply); toast.success('Copied') }}>Copy</button>
            {num && <a className={btn} href={`https://wa.me/${num}?text=${encodeURIComponent(reply)}`} target="_blank" rel="noopener noreferrer">Open in WhatsApp</a>}
          </div>
        </div>
      )}
    </form>
  )
}
