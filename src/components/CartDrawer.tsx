import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ShoppingBag, Trash2, X } from 'lucide-react'
import { useShop } from '@/lib/shop'
import { formatPKR, img } from '@/lib/format'
import { QuantityStepper } from './QuantityStepper'
import { FreeShippingProgress, TotalsTable } from './CartSummary'

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, items, count, updateQuantity, removeLine } = useShop()

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, setDrawerOpen])

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} aria-label="Close cart" />
      <div className="absolute inset-y-0 right-0 flex w-[420px] max-w-full animate-slide-in flex-col bg-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-semibold">Your cart <span className="text-muted">({count})</span></h2>
          <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full p-2 hover:bg-sand" aria-label="Close cart"><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand"><ShoppingBag size={32} className="text-emerald-800" /></div>
            <p className="font-display text-xl font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted">Discover handpicked fashion, gadgets and home essentials.</p>
            <Link to="/shop" onClick={() => setDrawerOpen(false)} className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-ivory hover:bg-emerald-800">Start shopping</Link>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4"><FreeShippingProgress /></div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 py-4">
                  <img src={img(item.product.image, 160, { h: 160, fit: 'cover' })} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-xl bg-sand object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link to="/products/$slug" params={{ slug: item.product.slug }} onClick={() => setDrawerOpen(false)} className="line-clamp-2 text-sm font-semibold hover:text-emerald-800">{item.product.name}</Link>
                    {Object.entries(item.options).map(([k, v]) => (
                      <p key={k} className="text-xs text-muted">{k}: {v}</p>
                    ))}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QuantityStepper size="sm" value={item.quantity} max={item.product.stock} onChange={(n) => updateQuantity(item.key, n)} />
                      <span className="text-sm font-bold">{formatPKR(item.lineTotal)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeLine(item.key)} className="self-start rounded-full p-1.5 text-muted hover:bg-sand hover:text-rose" aria-label={`Remove ${item.product.name}`}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-line bg-white px-5 py-5">
              <TotalsTable />
              <Link to="/cart" onClick={() => setDrawerOpen(false)} className="flex w-full items-center justify-center rounded-full bg-emerald-900 py-3.5 text-sm font-semibold text-ivory hover:bg-emerald-800">
                View cart & checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
