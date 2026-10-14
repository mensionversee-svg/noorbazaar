import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { coupons, products } from '@/data/catalog'
import type { Coupon, Product } from '@/data/catalog'
import { store } from '@/config/store'

export interface CartLine {
  key: string
  productId: number
  quantity: number
  options: Record<string, string>
}

interface ShopState {
  cart: Array<CartLine>
  wishlist: Array<number>
  couponCode: string | null
}

const STORAGE_KEY = 'noor-bazaar:v1'
const empty: ShopState = { cart: [], wishlist: [], couponCode: null }

export const lineKey = (productId: number, options: Record<string, string>) =>
  [productId, ...Object.entries(options).sort().map(([k, v]) => `${k}:${v}`)].join('|')

export interface CartTotals {
  items: Array<CartLine & { product: Product; lineTotal: number }>
  count: number
  subtotal: number
  savings: number
  coupon: Coupon | null
  couponDiscount: number
  shipping: number
  total: number
}

function computeTotals(state: ShopState): CartTotals {
  const items = state.cart.flatMap((line) => {
    const product = products.find((p) => p.id === line.productId)
    return product ? [{ ...line, product, lineTotal: product.price * line.quantity }] : []
  })
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  const savings = items.reduce((s, i) => s + ((i.product.compareAt ?? i.product.price) - i.product.price) * i.quantity, 0)
  const coupon = coupons.find((c) => c.code === state.couponCode) ?? null
  const couponValid = coupon && subtotal >= coupon.minSubtotal
  const couponDiscount = couponValid
    ? coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
    : 0
  const shipping = subtotal === 0 || subtotal >= store.shipping.freeThreshold ? 0 : store.shipping.standardFee
  return {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    savings,
    coupon: couponValid ? coupon : null,
    couponDiscount,
    shipping,
    total: subtotal - couponDiscount + shipping,
  }
}

interface ShopContextValue extends CartTotals {
  wishlist: Array<number>
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  addToCart: (productId: number, quantity?: number, options?: Record<string, string>) => void
  updateQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  clearCart: () => void
  applyCoupon: (code: string) => { ok: boolean; message: string }
  removeCoupon: () => void
  toggleWishlist: (productId: number) => void
  isWishlisted: (productId: number) => boolean
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ShopState>(empty)
  const [hydrated, setHydrated] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setState({ ...empty, ...JSON.parse(saved) })
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const addToCart = useCallback((productId: number, quantity = 1, options: Record<string, string> = {}) => {
    const product = products.find((p) => p.id === productId)
    if (!product || product.stock === 0) return
    const key = lineKey(productId, options)
    setState((s) => {
      const existing = s.cart.find((l) => l.key === key)
      const cart = existing
        ? s.cart.map((l) => (l.key === key ? { ...l, quantity: Math.min(product.stock, l.quantity + quantity) } : l))
        : [...s.cart, { key, productId, quantity: Math.min(product.stock, quantity), options }]
      return { ...s, cart }
    })
    setDrawerOpen(true)
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setState((s) => ({
      ...s,
      cart: s.cart.flatMap((l) => {
        if (l.key !== key) return [l]
        const stock = products.find((p) => p.id === l.productId)?.stock ?? 0
        const q = Math.min(stock, Math.max(0, quantity))
        return q === 0 ? [] : [{ ...l, quantity: q }]
      }),
    }))
  }, [])

  const removeLine = useCallback((key: string) => setState((s) => ({ ...s, cart: s.cart.filter((l) => l.key !== key) })), [])
  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [], couponCode: null })), [])

  const totals = useMemo(() => computeTotals(state), [state])

  const applyCoupon = useCallback(
    (raw: string) => {
      const code = raw.trim().toUpperCase()
      const coupon = coupons.find((c) => c.code === code)
      if (!coupon) return { ok: false, message: 'This coupon code is not valid.' }
      if (totals.subtotal < coupon.minSubtotal)
        return { ok: false, message: `Add items worth Rs. ${(coupon.minSubtotal - totals.subtotal).toLocaleString('en-PK')} more to use ${code}.` }
      setState((s) => ({ ...s, couponCode: code }))
      return { ok: true, message: `${code} applied — ${coupon.description}.` }
    },
    [totals.subtotal],
  )

  const removeCoupon = useCallback(() => setState((s) => ({ ...s, couponCode: null })), [])

  const toggleWishlist = useCallback(
    (productId: number) =>
      setState((s) => ({
        ...s,
        wishlist: s.wishlist.includes(productId) ? s.wishlist.filter((id) => id !== productId) : [...s.wishlist, productId],
      })),
    [],
  )

  const value: ShopContextValue = {
    ...totals,
    wishlist: state.wishlist,
    drawerOpen,
    setDrawerOpen,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    isWishlisted: (id) => state.wishlist.includes(id),
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
