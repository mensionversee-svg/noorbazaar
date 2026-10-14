import { Link, createFileRoute } from '@tanstack/react-router'
import { Lock, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react'
import { store, whatsappLink } from '@/config/store'
import { useShop } from '@/lib/shop'
import { formatPKR, img } from '@/lib/format'
import { bestSellers } from '@/data/catalog'
import { QuantityStepper } from '@/components/QuantityStepper'
import { CouponForm, FreeShippingProgress, TotalsTable } from '@/components/CartSummary'
import { ProductCard } from '@/components/ProductCard'

export const Route = createFileRoute('/cart')({
  component: CartPage,
  head: () => ({ meta: [{ title: `Your cart — ${store.name}` }, { name: 'robots', content: 'noindex' }] }),
})

const paymentMethods = ['Cash on Delivery', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Debit / Credit Card']

function CartPage() {
  const shop = useShop()
  const { items, count, updateQuantity, removeLine, total, coupon } = shop

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-sand text-emerald-800"><ShoppingBag size={40} /></span>
          <h1 className="mt-6 font-display text-4xl font-semibold text-emerald-950">Your cart is empty</h1>
          <p className="mt-3 text-muted">Looks like you haven’t added anything yet. Start with our customers’ favourites below.</p>
          <Link to="/shop" className="mt-8 rounded-full bg-emerald-900 px-8 py-4 font-semibold text-ivory hover:bg-emerald-800">Continue shopping</Link>
        </div>
        <h2 className="mb-8 mt-20 font-display text-3xl font-semibold text-emerald-950">Best sellers</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {bestSellers(4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    )
  }

  const orderText = [
    `Assalam o Alaikum ${store.name}! I'd like to order:`,
    ...items.map((i) => `• ${i.product.name}${Object.values(i.options).length ? ` (${Object.values(i.options).join(', ')})` : ''} × ${i.quantity} — ${formatPKR(i.lineTotal)}`),
    coupon ? `Coupon: ${coupon.code}` : '',
    `Total: ${formatPKR(total)} (Cash on Delivery)`,
  ].filter(Boolean).join('\n')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl font-semibold text-emerald-950 md:text-5xl">Shopping cart</h1>
      <p className="mt-2 text-sm text-muted">{count} {count === 1 ? 'item' : 'items'}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <ul className="divide-y divide-line rounded-3xl border border-line bg-white">
            {items.map((item) => (
              <li key={item.key} className="flex gap-4 p-4 sm:p-5">
                <Link to="/products/$slug" params={{ slug: item.product.slug }} className="shrink-0">
                  <img src={img(item.product.image, 240, { h: 240, fit: 'cover' })} alt={item.product.name} width={112} height={112} className="h-24 w-24 rounded-2xl bg-sand object-cover sm:h-28 sm:w-28" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{item.product.brand}</p>
                      <Link to="/products/$slug" params={{ slug: item.product.slug }} className="font-semibold hover:text-emerald-800">{item.product.name}</Link>
                      {Object.entries(item.options).map(([k, v]) => <p key={k} className="text-sm text-muted">{k}: {v}</p>)}
                    </div>
                    <button type="button" onClick={() => removeLine(item.key)} className="self-start rounded-full p-2 text-muted hover:bg-sand hover:text-rose" aria-label={`Remove ${item.product.name}`}><Trash2 size={18} /></button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                    <QuantityStepper size="sm" value={item.quantity} max={item.product.stock} onChange={(n) => updateQuantity(item.key, n)} />
                    <div className="text-right">
                      <p className="font-bold">{formatPKR(item.lineTotal)}</p>
                      {item.quantity > 1 && <p className="text-xs text-muted">{formatPKR(item.product.price)} each</p>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/shop" className="mt-5 inline-block text-sm font-semibold text-emerald-800 hover:text-emerald-950">← Continue shopping</Link>
        </div>

        <aside className="h-fit space-y-5 rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-36" aria-label="Order summary">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <FreeShippingProgress />
          <CouponForm />
          <TotalsTable />
          <div>
            <button type="button" disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-emerald-900/40 py-4 font-semibold text-ivory" aria-describedby="checkout-note">
              <Lock size={17} /> Secure checkout
            </button>
            <p id="checkout-note" className="mt-2 text-center text-xs text-muted">Online checkout is launching soon. Meanwhile, place your order on WhatsApp and pay Cash on Delivery.</p>
          </div>
          <a
            href={whatsappLink(orderText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-semibold text-white transition hover:brightness-95"
          >
            <MessageCircle size={18} /> Order on WhatsApp
          </a>
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Payment options</p>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((m) => <span key={m} className="rounded-md border border-line px-2 py-1 text-xs text-muted">{m}</span>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
