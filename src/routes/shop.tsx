import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { SearchX, SlidersHorizontal, X } from 'lucide-react'
import { categories, getCategory, products } from '@/data/catalog'
import type { Product } from '@/data/catalog'
import { sortOptions, validateShopSearch } from '@/lib/shop-search'
import type { ShopPatch, ShopSearch } from '@/lib/shop-search'
import { cn, formatPKR } from '@/lib/format'
import { store } from '@/config/store'
import { ProductCard } from '@/components/ProductCard'
import { Stars } from '@/components/Stars'

const PAGE_SIZE = 8

const priceRanges = [
  { label: 'Under Rs. 2,500', min: undefined, max: 2500 },
  { label: 'Rs. 2,500 – 4,000', min: 2500, max: 4000 },
  { label: 'Rs. 4,000 – 6,000', min: 4000, max: 6000 },
  { label: 'Over Rs. 6,000', min: 6000, max: undefined },
]

export const Route = createFileRoute('/shop')({
  validateSearch: validateShopSearch,
  component: Shop,
  head: () => ({
    meta: [
      { title: `Shop all products — ${store.name}` },
      { name: 'description', content: `Browse fashion, electronics, home and beauty at ${store.name}. Prices in PKR with Cash on Delivery across Pakistan.` },
    ],
  }),
})

function filterProducts(s: ShopSearch): Array<Product> {
  const terms = s.q?.toLowerCase().split(/\s+/).filter(Boolean) ?? []
  const list = products.filter((p) => {
    if (s.category && p.category !== s.category) return false
    if (s.sub && p.subcategory !== s.sub) return false
    if (s.min !== undefined && p.price < s.min) return false
    if (s.max !== undefined && p.price > s.max) return false
    if (s.rating && p.rating < s.rating) return false
    if (s.inStock && p.stock === 0) return false
    if (s.sale && !(p.compareAt && p.compareAt > p.price)) return false
    if (terms.length) {
      const hay = `${p.name} ${p.brand} ${getCategory(p.category)?.name ?? ''} ${p.shortDescription}`.toLowerCase()
      if (!terms.every((t) => hay.includes(t))) return false
    }
    return true
  })
  const sorters: Record<string, (a: Product, b: Product) => number> = {
    popular: (a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount,
    bestselling: (a, b) => b.sold - a.sold,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
  }
  return list.sort(sorters[s.sort ?? 'popular'])
}

function Shop() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [filtersOpen, setFiltersOpen] = useState(false)

  const results = useMemo(() => filterProducts(search), [search])
  const page = search.page ?? 1
  const visible = results.slice(0, page * PAGE_SIZE)
  const category = search.category ? getCategory(search.category) : undefined
  const subName = category?.subcategories.find((s) => s.slug === search.sub)?.name

  const update = (patch: ShopPatch) =>
    navigate({
      search: (prev) => {
        const merged = { ...prev, ...patch, page: undefined }
        return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) as ShopSearch
      },
      resetScroll: false,
    })

  const chips: Array<{ label: string; clear: ShopPatch }> = []
  if (search.q) chips.push({ label: `“${search.q}”`, clear: { q: undefined } })
  if (category) chips.push({ label: subName ? `${category.name} › ${subName}` : category.name, clear: { category: undefined, sub: undefined } })
  if (search.min !== undefined || search.max !== undefined)
    chips.push({
      label: `${search.min !== undefined ? formatPKR(search.min) : 'Rs. 0'} – ${search.max !== undefined ? formatPKR(search.max) : 'any'}`,
      clear: { min: undefined, max: undefined },
    })
  if (search.rating) chips.push({ label: `${search.rating}★ & up`, clear: { rating: undefined } })
  if (search.inStock) chips.push({ label: 'In stock', clear: { inStock: undefined } })
  if (search.sale) chips.push({ label: 'On sale', clear: { sale: undefined } })

  const title = search.q ? `Results for “${search.q}”` : subName ?? category?.name ?? (search.sale ? 'Sale' : 'All products')

  const filters = <Filters key={`${search.min}-${search.max}`} search={search} update={update} />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link to="/" className="hover:text-ink">Home</Link> <span className="mx-1.5">/</span>
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        {category && (<><span className="mx-1.5">/</span><span className="text-ink">{category.name}</span></>)}
      </nav>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-semibold text-emerald-950 md:text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-muted" aria-live="polite">{results.length} {results.length === 1 ? 'product' : 'products'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold lg:hidden">
            <SlidersHorizontal size={16} /> Filters {chips.length > 0 && <span className="rounded-full bg-emerald-900 px-1.5 text-xs text-ivory">{chips.length}</span>}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">Sort by</span>
            <select
              value={search.sort ?? 'popular'}
              onChange={(e) => update({ sort: e.target.value as ShopSearch['sort'] })}
              className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-emerald-700"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">{filters}</aside>

        <div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={() => update(c.clear)} className="flex items-center gap-1.5 rounded-full bg-emerald-900/5 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-900/10">
                  {c.label} <X size={14} aria-label="Remove filter" />
                </button>
              ))}
              <Link to="/shop" search={search.sort ? { sort: search.sort } : {}} className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">Clear all</Link>
            </div>
          )}

          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-emerald-800"><SearchX size={28} /></span>
              <h2 className="mt-5 font-display text-2xl font-semibold">No products found</h2>
              <p className="mt-2 max-w-sm text-sm text-muted">Try a different search term, remove some filters, or browse our best sellers.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/shop" className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-ivory hover:bg-emerald-800">Clear filters</Link>
                <Link to="/shop" search={{ sort: 'bestselling' }} className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold hover:bg-sand">Best sellers</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {visible.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
              </div>
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-sm text-muted">Showing {visible.length} of {results.length}</p>
                {visible.length < results.length && (
                  <button
                    type="button"
                    onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }), resetScroll: false })}
                    className="rounded-full border border-emerald-900 px-8 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-900 hover:text-ivory"
                  >
                    Load more
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[88vw] flex-col bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-semibold">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-full p-2 hover:bg-sand" aria-label="Close filters"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filters}</div>
            <div className="border-t border-line p-4">
              <button type="button" onClick={() => setFiltersOpen(false)} className="w-full rounded-full bg-emerald-900 py-3 text-sm font-semibold text-ivory">
                Show {results.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-6">
      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-900">{title}</legend>
      {children}
    </fieldset>
  )
}

function Filters({ search, update }: { search: ShopSearch; update: (p: ShopPatch) => void }) {
  const [min, setMin] = useState(search.min?.toString() ?? '')
  const [max, setMax] = useState(search.max?.toString() ?? '')
  const option = (active: boolean) =>
    cn('flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition', active ? 'bg-emerald-900 font-semibold text-ivory' : 'text-ink/80 hover:bg-sand')

  return (
    <div className="space-y-6">
      <FilterGroup title="Category">
        <ul className="space-y-0.5">
          <li><button type="button" className={option(!search.category)} onClick={() => update({ category: undefined, sub: undefined })}>All categories</button></li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button type="button" className={option(search.category === c.slug && !search.sub)} onClick={() => update({ category: c.slug, sub: undefined })}>
                {c.name}
                <span className="text-xs opacity-60">{products.filter((p) => p.category === c.slug).length}</span>
              </button>
              {search.category === c.slug && (
                <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-line pl-2">
                  {c.subcategories.map((s) => (
                    <li key={s.slug}>
                      <button type="button" className={option(search.sub === s.slug)} onClick={() => update({ category: c.slug, sub: s.slug })}>{s.name}</button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price">
        <ul className="space-y-0.5">
          {priceRanges.map((r) => {
            const active = search.min === r.min && search.max === r.max
            return (
              <li key={r.label}>
                <button
                  type="button"
                  className={option(active)}
                  onClick={() => {
                    setMin(r.min?.toString() ?? '')
                    setMax(r.max?.toString() ?? '')
                    update(active ? { min: undefined, max: undefined } : { min: r.min, max: r.max })
                  }}
                >
                  {r.label}
                </button>
              </li>
            )
          })}
        </ul>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const lo = min ? Math.max(0, parseInt(min, 10)) : undefined
            const hi = max ? Math.max(0, parseInt(max, 10)) : undefined
            update(lo !== undefined && hi !== undefined && lo > hi ? { min: hi, max: lo } : { min: lo, max: hi })
          }}
        >
          <label className="sr-only" htmlFor="price-min">Minimum price</label>
          <input id="price-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="Min" className="w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-700" />
          <span className="text-muted">–</span>
          <label className="sr-only" htmlFor="price-max">Maximum price</label>
          <input id="price-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="Max" className="w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-700" />
          <button type="submit" className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-semibold text-ivory">Go</button>
        </form>
      </FilterGroup>

      <FilterGroup title="Rating">
        <ul className="space-y-0.5">
          {[4, 3].map((r) => (
            <li key={r}>
              <button type="button" className={option(search.rating === r)} onClick={() => update({ rating: search.rating === r ? undefined : r })}>
                <span className="flex items-center gap-2"><Stars rating={r} size={13} /> & up</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 px-2.5 py-1.5 text-sm">
          <input type="checkbox" checked={!!search.inStock} onChange={(e) => update({ inStock: e.target.checked || undefined })} className="h-4 w-4 accent-emerald-900" />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 px-2.5 py-1.5 text-sm">
          <input type="checkbox" checked={!!search.sale} onChange={(e) => update({ sale: e.target.checked || undefined })} className="h-4 w-4 accent-emerald-900" />
          On sale
        </label>
      </FilterGroup>
    </div>
  )
}
