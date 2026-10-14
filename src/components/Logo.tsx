import { Link } from '@tanstack/react-router'
import { store } from '@/config/store'
import { cn } from '@/lib/format'

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 shrink-0', className)} aria-label={`${store.name} home`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={light ? '#faf6ef' : '#0f3d2e'} />
        <path
          d="M20 7l2.6 7.2L30 12l-4.4 6.3L33 22l-7.6 1.4L27 31l-7-3.8L13 31l1.6-7.6L7 22l7.4-3.7L10 12l7.4 2.2z"
          fill="#d4a24c"
        />
        <circle cx="20" cy="20.5" r="3.4" fill={light ? '#faf6ef' : '#0f3d2e'} />
      </svg>
      <span className="leading-none">
        <span className={cn('block font-display text-xl font-semibold', light ? 'text-ivory' : 'text-emerald-900')}>
          {store.name}
        </span>
        <span className={cn('block text-[10px] uppercase tracking-[0.2em] mt-1', light ? 'text-saffron-light' : 'text-muted')}>
          Online Store · Pakistan
        </span>
      </span>
    </Link>
  )
}
