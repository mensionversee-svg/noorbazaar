import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { ShopSearch } from '@/lib/shop-search'

export function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string
  title: string
  link?: { label: string; search: ShopSearch }
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">{eyebrow}</p>
        <h2 className="font-display text-3xl font-semibold text-emerald-950 md:text-4xl">{title}</h2>
      </div>
      {link && (
        <Link
          to="/shop"
          search={link.search}
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 sm:flex"
        >
          {link.label}
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
