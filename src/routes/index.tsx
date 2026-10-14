import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, Banknote, RotateCcw, Truck } from 'lucide-react'
import { store } from '@/config/store'
import { bestSellers, categories, featuredProducts, newArrivals, onSale, testimonials } from '@/data/catalog'
import type { Product } from '@/data/catalog'
import { formatPKR, img } from '@/lib/format'
import { ProductCard } from '@/components/ProductCard'
import { SectionHeading } from '@/components/SectionHeading'
import { Stars } from '@/components/Stars'
import { Newsletter } from '@/components/Newsletter'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'OnlineStore',
          name: store.name,
          description: store.description,
          email: store.email,
          telephone: store.phone,
          address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressCountry: 'PK' },
          currenciesAccepted: 'PKR',
          paymentAccepted: 'Cash on Delivery, Bank Transfer, Easypaisa, JazzCash, Credit Card',
        }),
      },
    ],
  }),
})

function ProductRow({ products }: { products: Array<Product> }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-6">
      {products.map((p) => (
        <div key={p.id} className="w-[46vw] shrink-0 snap-start sm:w-auto">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f4ecdf]">
      <img
        src={img(store.hero.image, 1600, { q: 80 })}
        alt="Embroidered emerald dupatta, Peshawari chappals, brass attar bottle and wireless earbuds on sandstone"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f4ecdf] via-[#f4ecdf]/85 to-transparent md:via-[#f4ecdf]/70 md:to-transparent" />
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-20 md:min-h-[620px] lg:px-6">
        <div className="max-w-xl animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> {store.hero.badge}
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] text-emerald-950 md:text-7xl">
            {store.hero.title}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/75">
            {store.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop" className="group inline-flex items-center gap-2 rounded-full bg-emerald-900 px-8 py-4 font-semibold text-ivory shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-800">
              Shop Now <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link to="/shop" search={{ sale: true }} className="inline-flex items-center rounded-full border border-emerald-950/20 bg-white/50 px-8 py-4 font-semibold text-emerald-950 backdrop-blur transition hover:bg-white">
              View offers
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  const items = [
    { icon: Truck, title: 'Free delivery', text: `On orders over ${formatPKR(store.shipping.freeThreshold)}` },
    { icon: Banknote, title: 'Cash on Delivery', text: 'Pay when it arrives' },
    { icon: RotateCcw, title: '7-day returns', text: 'Easy exchanges' },
    { icon: BadgeCheck, title: '100% authentic', text: 'Sourced from makers' },
  ]
  return (
    <section className="border-b border-line bg-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-4 py-7 md:grid-cols-4 lg:px-6">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-emerald-800"><Icon size={20} /></span>
            <span>
              <span className="block text-sm font-bold">{title}</span>
              <span className="block text-xs text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Categories() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 lg:px-6">
      <SectionHeading eyebrow="Browse" title="Shop by category" link={{ label: 'All products', search: {} }} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
            <img src={img(c.image, 400, { h: 534, fit: 'cover' })} alt="" loading="lazy" width={400} height={534} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
              <h3 className="font-display text-lg font-semibold leading-tight">{c.name}</h3>
              <p className="mt-0.5 text-xs text-ivory/75">{c.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      setLeft(end.getTime() - now.getTime())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  if (left === null) return ['--', '--', '--']
  const s = Math.floor(left / 1000)
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0'))
}

function FlashSale() {
  const [h, m, s] = useCountdown()
  const deals = onSale().slice(0, 4)
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6">
      <div className="rounded-3xl bg-sand p-5 md:p-10">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose">Limited-time offers</p>
            <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">Today’s flash deals</h2>
            <p className="mt-2 text-sm text-muted">Up to {Math.max(...deals.map((d) => Math.round(((d.compareAt! - d.price) / d.compareAt!) * 100)))}% off — prices reset at midnight.</p>
          </div>
          <div className="flex items-center gap-2" aria-label="Time left in today’s deals" role="timer">
            {[['Hrs', h], ['Min', m], ['Sec', s]].map(([label, v]) => (
              <div key={label} className="flex w-16 flex-col items-center rounded-xl bg-emerald-950 py-2 text-ivory">
                <span className="font-display text-2xl font-semibold tabular-nums">{v}</span>
                <span className="text-[10px] uppercase tracking-wider text-ivory/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <ProductRow products={deals} />
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6">
      <SectionHeading eyebrow="Loved across Pakistan" title="What our customers say" />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-2xl border border-line bg-white p-7">
            <Stars rating={t.rating} size={16} />
            <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed text-ink">“{t.quote}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900 font-semibold text-saffron">
                {t.name.split(' ').map((n) => n[0]).join('')}
              </span>
              <span>
                <span className="block text-sm font-bold">{t.name}</span>
                <span className="block text-xs text-muted">{t.city} · Verified buyer</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Categories />
      <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6">
        <SectionHeading eyebrow="Handpicked" title="Featured products" link={{ label: 'Shop all', search: {} }} />
        <ProductRow products={featuredProducts().slice(0, 4)} />
      </section>
      <FlashSale />
      <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6">
        <SectionHeading eyebrow="Most loved" title="Best sellers" link={{ label: 'View best sellers', search: { sort: 'bestselling' } }} />
        <ProductRow products={bestSellers(4)} />
      </section>
      <section className="mx-auto mt-24 max-w-7xl px-4 lg:px-6">
        <SectionHeading eyebrow="Just landed" title="New arrivals" link={{ label: 'See what’s new', search: { sort: 'newest' } }} />
        <ProductRow products={newArrivals(4)} />
      </section>
      <Testimonials />
      <Newsletter />
    </>
  )
}
