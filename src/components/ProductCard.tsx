import { Link } from '@tanstack/react-router'
import { Heart, ShoppingBag } from 'lucide-react'
import type { Product } from '@/data/catalog'
import { useShop } from '@/lib/shop'
import { cn, discountPercent, img } from '@/lib/format'
import { Price } from './Price'
import { Stars } from './Stars'

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop()
  const off = discountPercent(product.price, product.compareAt)
  const wished = isWishlisted(product.id)
  const soldOut = product.stock === 0
  const isNew = product.createdAt >= '2026-09-25'
  // Products with variants need a choice first, so send shoppers to the details page.
  const needsOptions = !!product.variants?.length

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-sand"
      >
        <img
          src={img(product.image, 480, { h: 480, fit: 'cover' })}
          srcSet={`${img(product.image, 320, { h: 320, fit: 'cover' })} 320w, ${img(product.image, 480, { h: 480, fit: 'cover' })} 480w, ${img(product.image, 720, { h: 720, fit: 'cover' })} 720w`}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          width={480}
          height={480}
          className={cn('h-full w-full object-cover transition duration-700 group-hover:scale-105', soldOut && 'opacity-60')}
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <span className="rounded-full bg-rose px-2.5 py-1 text-[11px] font-bold text-white">-{off}%</span>}
          {isNew && <span className="rounded-full bg-emerald-900 px-2.5 py-1 text-[11px] font-bold text-ivory">NEW</span>}
          {soldOut && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">SOLD OUT</span>}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wished}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
      >
        <Heart size={17} className={wished ? 'fill-rose text-rose' : 'text-ink'} />
      </button>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{product.brand}</p>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-emerald-800 sm:text-[15px]"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Stars rating={product.rating} size={12} />
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-auto pt-3">
          <Price price={product.price} compareAt={product.compareAt} />
          {soldOut ? (
            <span className="mt-3 flex w-full items-center justify-center rounded-xl border border-line py-2.5 text-sm font-semibold text-muted">
              Out of stock
            </span>
          ) : needsOptions ? (
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-900 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-900 hover:text-ivory"
            >
              Choose options
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 py-2.5 text-sm font-semibold text-ivory transition hover:bg-emerald-800"
            >
              <ShoppingBag size={16} /> Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
