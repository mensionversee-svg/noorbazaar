import { z } from 'zod'

export const sortOptions = [
  { value: 'popular', label: 'Most popular' },
  { value: 'bestselling', label: 'Best selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
] as const

export type SortValue = (typeof sortOptions)[number]['value']

const schema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  category: z.string().max(40).optional().catch(undefined),
  sub: z.string().max(40).optional().catch(undefined),
  min: z.number().int().min(0).optional().catch(undefined),
  max: z.number().int().min(0).optional().catch(undefined),
  rating: z.number().int().min(1).max(5).optional().catch(undefined),
  inStock: z.boolean().optional().catch(undefined),
  sale: z.boolean().optional().catch(undefined),
  sort: z.enum(sortOptions.map((o) => o.value) as [SortValue, ...Array<SortValue>]).optional().catch(undefined),
  page: z.number().int().min(1).max(50).optional().catch(undefined),
})

export type ShopSearch = {
  q?: string
  category?: string
  sub?: string
  min?: number
  max?: number
  rating?: number
  inStock?: boolean
  sale?: boolean
  sort?: SortValue
  page?: number
}

/** Like Partial<ShopSearch>, but each key may explicitly be set to undefined (to clear it). */
export type ShopPatch = { [K in keyof ShopSearch]?: ShopSearch[K] | undefined }

export const validateShopSearch = (input: Record<string, unknown>): ShopSearch => schema.parse(input)
