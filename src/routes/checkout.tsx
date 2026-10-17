import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useShop } from '@/lib/shop'
import { useAuth } from '@/lib/auth'
import { formatPKR } from '@/lib/format'
import { store, whatsappLink } from '@/config/store'
import { TotalsTable } from '@/components/CartSummary'
import type { OrderItem } from '@/lib/orders'
import { inputCls } from './auth'

export const Route = createFileRoute('/checkout')({
  component: Checkout,
  head: () => ({
    meta: [
      { title: `Checkout — ${store.name}` },
      { name: 'description', content: 'Place your order with Cash on Delivery.' },
      { property: 'og:title', content: `Checkout — ${store.name}` },
      { property: 'og:description', content: 'Place your order with Cash on Delivery.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
})

function Checkout() {
  const shop = useShop()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: user?.email ?? '', city: '', address: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto text-emerald-700" size={56} />
        <h1 className="mt-4 font-display text-4xl font-semibold text-emerald-950">Order placed!</h1>
        <p className="mt-3 text-muted">Shukriya! Aapka order reference <strong className="text-ink">{done}</strong> hai. Hum jald aap se call/WhatsApp par confirm karenge.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappLink(`Assalam o Alaikum! Mera order ${done} confirm karna hai.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white"><MessageCircle size={18} /> WhatsApp par confirm</a>
          <Link to="/shop" className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-sand">Continue shopping</Link>
        </div>
      </div>
    )
  }

  if (shop.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Cart khali hai</h1>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-emerald-900 px-6 py-3 font-semibold text-ivory">Shop now</Link>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[0-9+\s-]{10,15}$/.test(form.phone)) { toast.error('Sahi phone number likhein'); return }
    if (!/^[0-9+\s-]{10,15}$/.test(form.whatsapp)) { toast.error('Sahi WhatsApp number likhein'); return }
    setBusy(true)
    const id = crypto.randomUUID()
    const items: Array<OrderItem> = shop.items.map((i) => ({ productId: i.productId, name: i.product.name, price: i.product.price, quantity: i.quantity, options: i.options, image: i.product.image }))
    const { error } = await supabase.from('orders').insert({
      id,
      user_id: user?.id ?? null,
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim() || null,
      city: form.city.trim(),
      address: form.address.trim(),
      notes: form.notes.trim() || null,
      items: items as never,
      subtotal: shop.subtotal,
      discount: shop.couponDiscount,
      shipping: shop.shipping,
      total: shop.total,
      coupon: shop.coupon?.code ?? null,
    })
    setBusy(false)
    if (error) { toast.error('Order place nahi ho saka. Dobara koshish karein.'); return }
    shop.clearCart()
    setDone(id.slice(0, 8).toUpperCase())
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold text-emerald-950">Checkout</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form id="checkout" onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-semibold">Delivery details</h2>
          {!user && <p className="text-sm text-muted"><Link to="/auth" className="font-semibold text-emerald-800 underline">Sign in</Link> karein taake orders apne account mein dekh sakein (optional).</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <input required maxLength={80} placeholder="Full name" value={form.name} onChange={set('name')} className={inputCls} />
            <input required maxLength={15} placeholder="Phone (03xx xxxxxxx)" value={form.phone} onChange={set('phone')} className={inputCls} />
            <input required maxLength={15} inputMode="tel" placeholder="WhatsApp number (03xx xxxxxxx)" value={form.whatsapp} onChange={set('whatsapp')} className={inputCls} />
            <input type="email" maxLength={120} placeholder="Email (optional)" value={form.email} onChange={set('email')} className={inputCls} />
            <input required maxLength={60} placeholder="City" value={form.city} onChange={set('city')} className={inputCls} />
          </div>
          <textarea required maxLength={300} rows={3} placeholder="Full address" value={form.address} onChange={set('address')} className={inputCls} />
          <textarea maxLength={300} rows={2} placeholder="Notes (optional)" value={form.notes} onChange={set('notes')} className={inputCls} />
          <div className="rounded-xl bg-sand p-4 text-sm"><strong>Payment:</strong> Cash on Delivery — rider ko payment karein.</div>
        </form>
        <aside className="h-fit space-y-4 rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-semibold">Your order</h2>
          <ul className="space-y-2 text-sm">
            {shop.items.map((i) => (
              <li key={i.key} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><img src={i.product.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /><span>{i.product.name} × {i.quantity}</span></span><span className="font-medium">{formatPKR(i.lineTotal)}</span></li>
            ))}
          </ul>
          <TotalsTable />
          <button form="checkout" disabled={busy} className="w-full rounded-full bg-emerald-900 py-4 font-semibold text-ivory hover:bg-emerald-800 disabled:opacity-60">
            {busy ? 'Placing order…' : `Place order — ${formatPKR(shop.total)}`}
          </button>
        </aside>
      </div>
    </div>
  )
}
