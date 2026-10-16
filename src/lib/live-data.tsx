import { Fragment, createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { products, reviews } from '@/data/catalog'
import type { Product, Review } from '@/data/catalog'
import { store } from '@/config/store'

export type StoreSettings = typeof store

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand ?? '',
    category: r.category,
    subcategory: r.subcategory ?? '',
    price: r.price,
    compareAt: r.compare_at ?? undefined,
    rating: Number(r.rating ?? 5),
    reviewCount: r.review_count ?? 0,
    stock: r.stock ?? 0,
    sold: r.sold ?? 0,
    createdAt: String(r.created_at).slice(0, 10),
    image: r.image || '/img/hero.png',
    featured: !!r.featured,
    shortDescription: r.short_description ?? '',
    description: r.description ?? '',
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    specs: r.specs && typeof r.specs === 'object' ? r.specs : {},
    variants: Array.isArray(r.variants) ? r.variants : [],
  }
}

function deepAssign(target: any, src: any) {
  for (const [k, v] of Object.entries(src ?? {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') deepAssign(target[k], v)
    else if (v !== undefined && v !== null) target[k] = v
  }
}

async function fetchAllProducts() {
  const all: Array<any> = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('products').select('*').order('id').range(from, from + 999)
    if (error || !data) break
    all.push(...data)
    if (data.length < 1000) break
  }
  return { data: all }
}

export async function loadLiveData() {
  const [p, r, s] = await Promise.all([
    fetchAllProducts(),
    supabase.from('reviews').select('*').eq('hidden', false).order('created_at', { ascending: false }),
    supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
  ])
  if (p.data?.length) products.splice(0, products.length, ...p.data.map(rowToProduct))
  if (r.data?.length)
    reviews.splice(
      0,
      reviews.length,
      ...r.data.map(
        (x): Review => ({ productId: x.product_id, author: x.author, city: x.city, rating: x.rating, date: x.created_at.slice(0, 10), title: x.title, body: x.body, verified: x.verified }),
      ),
    )
  if (s.data?.data) deepAssign(store, s.data.data)
}

const LiveCtx = createContext<{ refresh: () => Promise<void>; ready: boolean }>({ refresh: async () => {}, ready: false })
export const useLiveData = () => useContext(LiveCtx)

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)
  const [ready, setReady] = useState(false)
  const refresh = useCallback(async () => {
    try {
      await loadLiveData()
    } finally {
      setReady(true)
      setVersion((v) => v + 1)
    }
  }, [])
  useEffect(() => {
    void refresh()
  }, [refresh])
  return (
    <LiveCtx.Provider value={{ refresh, ready }}>
      <Fragment key={version}>{children}</Fragment>
    </LiveCtx.Provider>
  )
}
