import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { store } from '@/config/store'
import { categories } from '@/data/catalog'
import { useShop } from '@/lib/shop'
import { Logo } from './Logo'
import { useAuth } from '@/lib/auth'

function SearchForm({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        navigate({ to: '/shop', search: q.trim() ? { q: q.trim() } : {} })
        onDone?.()
      }}
      className="relative w-full"
    >
      <label htmlFor="site-search" className="sr-only">Search products</label>
      <input
        id="site-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search lawn suits, earbuds, attar…"
        maxLength={80}
        className="w-full rounded-full border border-line bg-white py-2.5 pl-11 pr-24 text-sm outline-none transition placeholder:text-muted focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
      />
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-emerald-900 px-4 py-1.5 text-xs font-semibold text-ivory hover:bg-emerald-800"
      >
        Search
      </button>
    </form>
  )
}

function AnnouncementBar() {
  const items = [...store.announcements, ...store.announcements]
  return (
    <div className="overflow-hidden bg-emerald-950 py-2 text-xs font-medium text-saffron-light">
      <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
        {items.map((a, i) => (
          <span key={i} className="flex items-center gap-16" aria-hidden={i >= store.announcements.length}>
            {a}
            <span className="text-saffron">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function Header() {
  const { count, wishlist, setDrawerOpen } = useShop()
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const iconBtn = 'relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-sand'
  const badge = 'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[10px] font-bold text-emerald-950'

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-30 border-b border-line bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:gap-8 lg:px-6">
          <button type="button" className={`${iconBtn} lg:hidden`} onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Logo />
          <div className="hidden flex-1 md:block">
            <SearchForm />
          </div>
          <nav aria-label="Account and cart" className="ml-auto flex items-center gap-1 md:ml-0">
            {isAdmin && <Link to="/admin" className="rounded-full bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-ivory">Admin</Link>}
            <Link to={user ? '/account' : '/auth'} className={iconBtn} aria-label={user ? 'My account' : 'Sign in'}>
              <User size={21} />
            </Link>
            <Link to="/wishlist" className={iconBtn} aria-label={`Wishlist (${wishlist.length} items)`}>
              <Heart size={21} />
              {wishlist.length > 0 && <span className={badge}>{wishlist.length}</span>}
            </Link>
            <button type="button" onClick={() => setDrawerOpen(true)} className={iconBtn} aria-label={`Cart (${count} items)`}>
              <ShoppingBag size={21} />
              {count > 0 && <span className={badge}>{count}</span>}
            </button>
          </nav>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <SearchForm />
        </div>
        <nav aria-label="Categories" className="hidden border-t border-line lg:block">
          <ul className="mx-auto flex max-w-7xl items-center gap-8 px-6 text-sm font-medium">
            <li>
              <Link to="/shop" search={{ sort: 'newest' }} className="block py-3 text-emerald-800 hover:text-emerald-950">New In</Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug} className="group relative">
                <Link to="/shop" search={{ category: c.slug }} className="block py-3 text-ink/80 transition hover:text-emerald-900">
                  {c.name}
                </Link>
                <div className="invisible absolute left-0 top-full z-20 min-w-48 translate-y-1 rounded-xl border border-line bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {c.subcategories.map((s) => (
                    <Link
                      key={s.slug}
                      to="/shop"
                      search={{ category: c.slug, sub: s.slug }}
                      className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-sand hover:text-emerald-900"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
            <li className="ml-auto">
              <Link to="/shop" search={{ sale: true }} className="block py-3 font-semibold text-rose">Sale</Link>
            </li>
          </ul>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-ivory p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button type="button" className={iconBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto" onClick={() => setMenuOpen(false)}>
              <Link to="/shop" className="rounded-lg px-3 py-2.5 font-semibold hover:bg-sand">Shop all</Link>
              <Link to="/shop" search={{ sort: 'newest' }} className="rounded-lg px-3 py-2.5 hover:bg-sand">New In</Link>
              {categories.map((c) => (
                <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="rounded-lg px-3 py-2.5 hover:bg-sand">
                  {c.name}
                </Link>
              ))}
              <Link to="/shop" search={{ sale: true }} className="rounded-lg px-3 py-2.5 font-semibold text-rose hover:bg-sand">Sale</Link>
              <hr className="my-3 border-line" />
              <Link to="/wishlist" className="rounded-lg px-3 py-2.5 hover:bg-sand">Wishlist</Link>
              <Link to="/cart" className="rounded-lg px-3 py-2.5 hover:bg-sand">Cart</Link>
              <Link to="/help/$slug" params={{ slug: 'faq' }} className="rounded-lg px-3 py-2.5 hover:bg-sand">Help & FAQs</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
