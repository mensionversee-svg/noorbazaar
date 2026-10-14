import { Link, createFileRoute } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { products } from '@/data/catalog'
import { store } from '@/config/store'
import { useShop } from '@/lib/shop'
import { ProductCard } from '@/components/ProductCard'

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
  head: () => ({ meta: [{ title: `Wishlist — ${store.name}` }, { name: 'robots', content: 'noindex' }] }),
})

function WishlistPage() {
  const { wishlist } = useShop()
  const items = products.filter((p) => wishlist.includes(p.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl font-semibold text-emerald-950 md:text-5xl">Your wishlist</h1>
      <p className="mt-2 text-sm text-muted">Saved on this device. Sign-in to sync across devices is coming soon.</p>
      {items.length === 0 ? (
        <div className="mx-auto mt-12 flex max-w-md flex-col items-center text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-sand text-rose"><Heart size={40} /></span>
          <h2 className="mt-6 font-display text-2xl font-semibold">Nothing saved yet</h2>
          <p className="mt-2 text-muted">Tap the heart on any product to save it for later.</p>
          <Link to="/shop" className="mt-8 rounded-full bg-emerald-900 px-8 py-4 font-semibold text-ivory hover:bg-emerald-800">Discover products</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
