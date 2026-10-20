import { describe, expect, it } from 'vitest'
import { productsToCsv, readAllExportProducts } from '@/lib/product-export'
import type { ExportProduct } from '@/lib/product-export'

const product: ExportProduct = {
  id: 1, name: 'Suit, "green"', slug: 'green-suit', brand: 'Noor', category: 'women', subcategory: 'suits', price: 1150, compare_at: null,
  stock: 100, featured: true, description: 'Line one\nLine two', short_description: '=SUM(A1)', highlights: ['Cotton'], specs: { fabric: 'cotton' }, variants: [],
  rating: 5, review_count: 2, sold: 10, created_at: '2026-10-20', image: '/img/main.jpg', images: ['/img/main.jpg', 'https://example.com/second.jpg', '/img/third.jpg'],
}

describe('Product CSV export', () => {
  it('includes every stored detail and every unique picture URL', () => {
    const csv = productsToCsv([product], 'https://noorbazaar.lovable.app')
    expect(csv).toContain('"specs","variants"')
    expect(csv).toContain('"image_count","image_1","image_2","image_3"')
    expect(csv).toContain('https://noorbazaar.lovable.app/img/main.jpg')
    expect(csv).toContain('https://example.com/second.jpg')
    expect(csv).toContain('https://noorbazaar.lovable.app/img/third.jpg')
    expect(csv).toContain('"1150"')
    expect(csv).toContain('"Suit, ""green"""')
    expect(csv).toContain('"Line one\nLine two"')
    expect(csv).toContain('"\'=SUM(A1)"')
  })
  it('exports all 2816 products rather than only the first 1000', async () => {
    const calls: number[] = []
    const rows = await readAllExportProducts(async (from) => {
      calls.push(from)
      return Array.from({ length: Math.min(1000, 2816 - from) }, (_, i) => ({ ...product, id: from + i }))
    })
    expect(rows).toHaveLength(2816)
    expect(calls).toEqual([0, 1000, 2000])
    expect(rows.at(-1)?.id).toBe(2815)
  })
  it('fails instead of producing a partial download when a page fails', async () => {
    await expect(readAllExportProducts(async (from) => {
      if (from) throw new Error('Network failed')
      return Array.from({ length: 1000 }, () => product)
    })).rejects.toThrow('Network failed')
  })
})