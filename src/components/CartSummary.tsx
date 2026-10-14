import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { store } from '@/config/store'
import { useShop } from '@/lib/shop'
import { formatPKR } from '@/lib/format'

export function FreeShippingProgress() {
  const { subtotal } = useShop()
  const remaining = store.shipping.freeThreshold - subtotal
  const pct = Math.min(100, (subtotal / store.shipping.freeThreshold) * 100)
  return (
    <div className="rounded-xl bg-saffron-light/50 p-3 text-sm">
      <p className="mb-2 text-emerald-950">
        {remaining > 0 ? (
          <>Add <strong>{formatPKR(remaining)}</strong> more for <strong>free delivery</strong></>
        ) : (
          <>🎉 You’ve unlocked <strong>free delivery</strong></>
        )}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-emerald-800 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function CouponForm() {
  const { coupon, applyCoupon, removeCoupon } = useShop()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null)

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-700/30 bg-emerald-700/5 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-semibold text-emerald-800"><Tag size={15} /> {coupon.code} applied</span>
        <button type="button" onClick={removeCoupon} className="rounded-full p-1 text-muted hover:bg-white hover:text-ink" aria-label="Remove coupon"><X size={15} /></button>
      </div>
    )
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!code.trim()) return
        setMsg(applyCoupon(code))
      }}
    >
      <label htmlFor="coupon" className="sr-only">Coupon code</label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20))}
          placeholder="Coupon code"
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-sm uppercase outline-none placeholder:normal-case focus:border-emerald-700"
        />
        <button type="submit" className="rounded-xl border border-emerald-900 px-4 text-sm font-semibold text-emerald-900 hover:bg-emerald-900 hover:text-ivory">Apply</button>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? 'text-emerald-700' : 'text-rose'}`} role="status">{msg.message}</p>}
    </form>
  )
}

export function TotalsTable() {
  const { subtotal, savings, coupon, couponDiscount, shipping, total } = useShop()
  const row = 'flex justify-between text-sm'
  return (
    <dl className="space-y-2">
      <div className={row}><dt className="text-muted">Subtotal</dt><dd className="font-medium">{formatPKR(subtotal)}</dd></div>
      {savings > 0 && <div className={row}><dt className="text-muted">You save on sale items</dt><dd className="font-medium text-emerald-700">{formatPKR(savings)}</dd></div>}
      {coupon && <div className={row}><dt className="text-muted">Coupon ({coupon.code})</dt><dd className="font-medium text-emerald-700">−{formatPKR(couponDiscount)}</dd></div>}
      <div className={row}><dt className="text-muted">Delivery</dt><dd className="font-medium">{shipping === 0 ? 'Free' : formatPKR(shipping)}</dd></div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPKR(total)}</dd></div>
    </dl>
  )
}
