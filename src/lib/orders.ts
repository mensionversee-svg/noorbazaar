export const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof orderStatuses)[number]

export const statusLabel: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const statusColor: Record<string, string> = {
  pending: 'bg-saffron-light text-emerald-950',
  confirmed: 'bg-emerald-700/10 text-emerald-800',
  shipped: 'bg-sand text-emerald-900',
  delivered: 'bg-emerald-900 text-ivory',
  cancelled: 'bg-rose/10 text-rose',
}

export interface OrderItem {
  productId: number
  name: string
  price: number
  quantity: number
  options: Record<string, string>
  image: string
}

export const orderRef = (o: { order_number?: number | null; id: string }) => (o.order_number ? `NB-${1000 + o.order_number}` : o.id.slice(0, 8).toUpperCase())
