import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Banknote, Check, Heart, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap } from 'lucide-react'
import { getCategory, getProductBySlug, getRelated, getReviews } from '@/data/catalog'
import type { Category, Product, Review } from '@/data/catalog'
import { store } from '@/config/store'
import { useShop } from '@/lib/shop'
import { cn, img } from '@/lib/format'
import { Price } from '@/components/Price'
import { Stars } from '@/components/Stars'
import { ProductCard } from '@/components/ProductCard'
import { QuantityStepper } from '@/components/QuantityStepper'

export const Route = createFileRoute('/products/$slug')({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug)
    if (!product) throw notFound()
    return { product, reviews: getReviews(product.id), related: getRelated(product), category: getCategory(product.category) }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { product, reviews } = loaderData
    return {
      meta: [
        { title: `${product.name} — ${store.name}` },
        { name: 'description', content: product.shortDescription },
        { property: 'og:title', content: product.name },
        { property: 'og:description', content: product.shortDescription },
        { property: 'og:image', content: img(product.image, 1200, { fit: 'cover' }) },
        { property: 'og:type', content: 'product' },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image,
            sku: `NB-${product.id}`,
            brand: { '@type': 'Brand', name: product.brand },
            aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
            review: reviews.slice(0, 3).map((r) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: r.author },
              reviewRating: { '@type': 'Rating', ratingValue: r.rating },
              reviewBody: r.body,
            })),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'PKR',
              price: product.price,
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          }),
        },
      ],
    }
  },
  component: ProductRoute,
})

// Keyed by product so option, quantity and gallery state reset when moving between products.
function ProductRoute() {
  const data = Route.useLoaderData()
  return <ProductPage key={data.product.id} {...data} />
}

function Gallery({ image, alt, lifestyle }: { image: string; alt: string; lifestyle?: string }) {
  // Alternate views are crops of the studio shot plus the category lifestyle image,
  // until per-product galleries arrive with admin image uploads.
  const views = [
    { thumb: img(image, 160, { h: 160, fit: 'cover' }), full: img(image, 1000, { h: 1000, fit: 'cover' }), zoom: img(image, 1800) },
    { thumb: img(image, 160, { h: 100, fit: 'cover', position: 'top' }), full: img(image, 1000, { h: 620, fit: 'cover', position: 'top' }), zoom: img(image, 1800) },
    { thumb: img(image, 160, { h: 100, fit: 'cover', position: 'bottom' }), full: img(image, 1000, { h: 620, fit: 'cover', position: 'bottom' }), zoom: img(image, 1800) },
    ...(lifestyle ? [{ thumb: img(lifestyle, 160, { h: 160, fit: 'cover' }), full: img(lifestyle, 1000, { h: 1000, fit: 'cover' }), zoom: img(lifestyle, 1800) }] : []),
  ]
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const view = views[active] ?? views[0]!

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="no-scrollbar flex gap-3 overflow-x-auto md:flex-col" role="tablist" aria-label="Product images">
        {views.map((v, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn('h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-sand transition', i === active ? 'border-emerald-900' : 'border-transparent opacity-70 hover:opacity-100')}
          >
            <img src={v.thumb} alt="" className="h-full w-full object-cover" width={80} height={80} />
          </button>
        ))}
      </div>
      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-sand"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <img src={view.full} alt={alt} width={1000} height={1000} className="h-full w-full object-cover" />
        {zoom && (
          <div
            className="pointer-events-none absolute inset-0 hidden bg-no-repeat md:block"
            style={{ backgroundImage: `url(${view.zoom})`, backgroundSize: '220%', backgroundPosition: `${zoom.x}% ${zoom.y}%` }}
            aria-hidden="true"
          />
        )}
        <span className="pointer-events-none absolute bottom-4 right-4 hidden rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-muted backdrop-blur md:block">Hover to zoom</span>
      </div>
    </div>
  )
}

interface ProductPageProps {
  product: Product
  reviews: Array<Review>
  related: Array<Product>
  category?: Category
}

function ProductPage({ product, reviews, related, category }: ProductPageProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop()
  const navigate = useNavigate()
  const [options, setOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.variants ?? []).map((v) => [v.name, v.options[0] ?? ''])),
  )
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const soldOut = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const wished = isWishlisted(product.id)

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link to="/" className="hover:text-ink">Home</Link> <span className="mx-1.5">/</span>
        {category && (<><Link to="/shop" search={{ category: category.slug }} className="hover:text-ink">{category.name}</Link> <span className="mx-1.5">/</span></>)}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery image={product.image} alt={product.name} lifestyle={category?.image} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-emerald-950 md:text-4xl">{product.name}</h1>
          <button type="button" onClick={() => { setTab('reviews'); document.getElementById('details')?.scrollIntoView() }} className="mt-3 flex items-center gap-2 text-sm text-muted hover:text-ink">
            <Stars rating={product.rating} size={16} /> <span className="font-semibold text-ink">{product.rating}</span> · {product.reviewCount} reviews · {product.sold.toLocaleString('en-PK')} sold
          </button>
          <div className="mt-6"><Price price={product.price} compareAt={product.compareAt} size="lg" /></div>
          <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
          <p className="mt-5 leading-relaxed text-ink/80">{product.shortDescription}</p>

          <p className={cn('mt-5 flex items-center gap-2 text-sm font-semibold', soldOut ? 'text-rose' : lowStock ? 'text-[#b4691f]' : 'text-emerald-700')}>
            <span className={cn('h-2 w-2 rounded-full', soldOut ? 'bg-rose' : lowStock ? 'bg-[#b4691f]' : 'bg-emerald-700')} />
            {soldOut ? 'Out of stock' : lowStock ? `Only ${product.stock} left — order soon` : 'In stock, ready to ship'}
          </p>

          {product.variants?.map((group) => (
            <fieldset key={group.name} className="mt-6">
              <legend className="mb-2.5 text-sm font-semibold">{group.name}: <span className="font-normal text-muted">{options[group.name]}</span></legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={options[group.name] === opt}
                    onClick={() => setOptions((o) => ({ ...o, [group.name]: opt }))}
                    className={cn('min-w-12 rounded-full border px-4 py-2 text-sm font-medium transition', options[group.name] === opt ? 'border-emerald-900 bg-emerald-900 text-ivory' : 'border-line bg-white hover:border-emerald-900')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {!soldOut && <QuantityStepper value={qty} max={product.stock} onChange={(n) => setQty(Math.max(1, Math.min(product.stock, n)))} />}
            <button
              type="button"
              disabled={soldOut}
              onClick={() => addToCart(product.id, qty, options)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 font-semibold text-ivory transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-muted"
            >
              <ShoppingBag size={18} /> {soldOut ? 'Sold out' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white transition hover:border-rose"
            >
              <Heart size={20} className={wished ? 'fill-rose text-rose' : ''} />
            </button>
          </div>
          {!soldOut && (
            <button
              type="button"
              onClick={() => {
                addToCart(product.id, qty, options)
                navigate({ to: '/cart' })
              }}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-saffron font-semibold text-emerald-950 transition hover:bg-saffron-light"
            >
              <Zap size={18} /> Buy now
            </button>
          )}

          <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white text-sm">
            <li className="flex gap-3 p-4">
              <Truck size={20} className="shrink-0 text-emerald-800" />
              <span>
                <strong className="block">Delivery across Pakistan</strong>
                <span className="text-muted">{store.shipping.majorCities.join(', ')}: {store.shipping.majorCityDays}. Other cities: {store.shipping.otherCityDays}. Free over Rs. {store.shipping.freeThreshold.toLocaleString('en-PK')}.</span>
              </span>
            </li>
            <li className="flex gap-3 p-4"><Banknote size={20} className="shrink-0 text-emerald-800" /><span><strong className="block">Cash on Delivery available</strong><span className="text-muted">Pay the rider when your order arrives.</span></span></li>
            <li className="flex gap-3 p-4"><RotateCcw size={20} className="shrink-0 text-emerald-800" /><span><strong className="block">7-day easy returns</strong><Link to="/help/$slug" params={{ slug: 'return-policy' }} className="text-muted underline underline-offset-2 hover:text-ink">Read the return policy</Link></span></li>
            <li className="flex gap-3 p-4"><ShieldCheck size={20} className="shrink-0 text-emerald-800" /><span><strong className="block">100% authentic</strong><span className="text-muted">Sourced directly from brands and artisans.</span></span></li>
          </ul>
        </div>
      </div>

      <section id="details" className="mt-16 scroll-mt-32">
        <div className="flex gap-1 border-b border-line" role="tablist">
          {([['description', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${product.reviewCount})`]] as const).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn('-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition', tab === key ? 'border-emerald-900 text-emerald-950' : 'border-transparent text-muted hover:text-ink')}>
              {label}
            </button>
          ))}
        </div>
        <div className="py-8" role="tabpanel">
          {tab === 'description' && (
            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
              <p className="max-w-2xl leading-relaxed text-ink/80">{product.description}</p>
              <ul className="space-y-2.5">
                {product.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-sm"><Check size={18} className="shrink-0 text-emerald-700" /> {h}</li>
                ))}
              </ul>
            </div>
          )}
          {tab === 'specs' && (
            <dl className="max-w-2xl divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[160px_1fr] gap-4 px-5 py-3.5 text-sm">
                  <dt className="font-semibold text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === 'reviews' && (
            <div className="grid gap-10 md:grid-cols-[260px_1fr]">
              <div>
                <p className="font-display text-5xl font-semibold">{product.rating}</p>
                <Stars rating={product.rating} size={18} className="mt-2" />
                <p className="mt-1 text-sm text-muted">Based on {product.reviewCount} reviews</p>
                {reviews.length > 0 && (
                  <ul className="mt-5 space-y-1.5">
                    {breakdown.map(({ star, count }) => (
                      <li key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{star}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-saffron" style={{ width: `${(count / reviews.length) * 100}%` }} /></div>
                        <span className="w-4 text-right text-muted">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-muted">No written reviews yet for this product.</p>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((r) => (
                    <li key={r.author + r.date} className="rounded-2xl border border-line bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <Stars rating={r.rating} />
                        <time className="text-xs text-muted" dateTime={r.date}>{new Date(r.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                      </div>
                      <p className="mt-3 font-semibold">{r.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/80">{r.body}</p>
                      <p className="mt-3 text-xs text-muted">{r.author}, {r.city}{r.verified && <span className="ml-2 font-semibold text-emerald-700">✓ Verified purchase</span>}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-8 font-display text-3xl font-semibold text-emerald-950">You may also like</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
