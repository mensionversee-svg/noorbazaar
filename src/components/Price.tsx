import { cn, discountPercent, formatPKR } from '@/lib/format'

export function Price({ price, compareAt, size = 'md' }: { price: number; compareAt?: number; size?: 'md' | 'lg' }) {
  const off = discountPercent(price, compareAt)
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={cn('font-bold text-ink', size === 'lg' ? 'text-3xl' : 'text-base')}>{formatPKR(price)}</span>
      {off > 0 && (
        <>
          <span className={cn('text-muted line-through', size === 'lg' ? 'text-lg' : 'text-sm')}>{formatPKR(compareAt!)}</span>
          {size === 'lg' && (
            <span className="rounded-full bg-rose/10 px-2.5 py-0.5 text-sm font-semibold text-rose">Save {off}%</span>
          )}
        </>
      )}
    </div>
  )
}
