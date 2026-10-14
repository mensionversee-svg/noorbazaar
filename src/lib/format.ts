const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 })

/** Formats a rupee amount as "Rs. 1,999". */
export const formatPKR = (amount: number) => `Rs. ${pkr.format(Math.round(amount))}`

export const discountPercent = (price: number, compareAt?: number) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0

/** Returns the image URL. Kept as a helper so an image CDN can be added later. */
export function img(
  src: string,
  _w: number,
  _opts: { h?: number; fit?: 'cover' | 'contain'; position?: string; q?: number } = {},
) {
  return src
}

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')
