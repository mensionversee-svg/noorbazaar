import { useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { downloadProductCsv, productsToCsv, readAllExportProducts } from '@/lib/product-export'

export function ProductExport() {
  const [file, setFile] = useState<Blob | null>(null)
  const [count, setCount] = useState(0)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    setBusy(true)
    setFile(null)
    setError('')
    void readAllExportProducts(async (from, to) => {
      const { data, error } = await supabase.from('products').select('*').order('id').range(from, to)
      if (error) throw error
      if (!data) throw new Error('Products could not be loaded')
      return data
    }).then((products) => {
      if (!active) return
      setCount(products.length)
      setFile(new Blob([productsToCsv(products, window.location.origin)], { type: 'text/csv;charset=utf-8' }))
    }).catch(() => {
      if (active) setError('Products load nahi ho sake. Dobara koshish karein.')
    }).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [version])

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-emerald-950">Export products</h2>
      <p role="status" className="text-sm text-muted">{busy ? 'CSV tayyar ho rahi hai…' : error || `${count.toLocaleString()} products · All details · All image links`}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="bg-emerald-900 text-ivory" disabled={busy || !file || count === 0} onClick={() => {
          if (file) downloadProductCsv(file, `noorbazaar-products-${new Date().toISOString().slice(0, 10)}.csv`)
        }}><Download />Download CSV</Button>
        <Button type="button" variant="outline" className="border-line" disabled={busy} onClick={() => setVersion((v) => v + 1)}><RefreshCw />Refresh</Button>
      </div>
    </section>
  )
}