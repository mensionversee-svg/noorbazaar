import type { Tables } from '@/integrations/supabase/types'

export type ExportProduct = Tables<'products'>
const columns = ['id', 'slug', 'name', 'brand', 'category', 'subcategory', 'price', 'compare_at', 'stock', 'featured', 'description', 'short_description', 'highlights', 'specs', 'variants', 'rating', 'review_count', 'sold', 'created_at', 'image', 'images'] as const

function csvCell(value: unknown): string {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  // Prevent spreadsheet formulas in customer-editable product fields.
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export function productsToCsv(products: ExportProduct[], origin: string): string {
  const resolve = (src: string) => src ? new URL(src, origin).href : ''
  const galleries = products.map((p) => [...new Set([p.image, ...p.images].filter(Boolean))].map(resolve))
  const imageCount = Math.max(0, ...galleries.map((images) => images.length))
  const headers = [...columns, 'image_count', ...Array.from({ length: imageCount }, (_, i) => `image_${i + 1}`)]
  const lines = products.map((p, index) => {
    const gallery = galleries[index] ?? []
    const values = columns.map((key) => key === 'image' ? resolve(p.image) : key === 'images' ? gallery : p[key])
    return [...values, gallery.length, ...Array.from({ length: imageCount }, (_, i) => gallery[i] ?? '')].map(csvCell).join(',')
  })
  return '\uFEFF' + [headers.map(csvCell).join(','), ...lines].join('\r\n')
}

export async function readAllExportProducts(fetchPage: (from: number, to: number) => Promise<ExportProduct[]>): Promise<ExportProduct[]> {
  const all: ExportProduct[] = []
  for (let from = 0; ; from += 1000) {
    const page = await fetchPage(from, from + 999)
    all.push(...page)
    if (page.length < 1000) return all
  }
}

export function downloadProductCsv(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}