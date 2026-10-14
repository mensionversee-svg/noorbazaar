import { Star } from 'lucide-react'
import { cn } from '@/lib/format'

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-saffron text-saffron' : 'fill-line text-line'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
