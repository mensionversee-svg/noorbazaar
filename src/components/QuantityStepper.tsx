import { Minus, Plus } from 'lucide-react'

export function QuantityStepper({
  value,
  max,
  onChange,
  size = 'md',
}: {
  value: number
  max: number
  onChange: (n: number) => void
  size?: 'sm' | 'md'
}) {
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-12 w-12'
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button type="button" className={`${btn} flex items-center justify-center rounded-full hover:bg-sand disabled:opacity-40`} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus size={size === 'sm' ? 14 : 16} />
      </button>
      <span className={`min-w-8 text-center font-semibold ${size === 'sm' ? 'text-sm' : ''}`} aria-live="polite">{value}</span>
      <button type="button" className={`${btn} flex items-center justify-center rounded-full hover:bg-sand disabled:opacity-40`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  )
}
