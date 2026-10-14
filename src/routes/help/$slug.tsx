import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { faqs, infoPages } from '@/data/catalog'
import { store, whatsappLink } from '@/config/store'
import { cn } from '@/lib/format'

const nav = [{ slug: 'faq', title: 'FAQs' }, ...infoPages.map((p) => ({ slug: p.slug, title: p.title }))]

export const Route = createFileRoute('/help/$slug')({
  loader: ({ params }) => {
    if (params.slug === 'faq') return { kind: 'faq' as const, title: 'Frequently asked questions' }
    const page = infoPages.find((p) => p.slug === params.slug)
    if (!page) throw notFound()
    return { kind: 'page' as const, title: page.title, page }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? 'Help'} — ${store.name}` }],
    scripts:
      loaderData?.kind === 'faq'
        ? [{
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }),
          }]
        : [],
  }),
  component: HelpPage,
})

function HelpPage() {
  const data = Route.useLoaderData()
  const { slug } = Route.useParams()

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[220px_1fr] lg:px-6">
      <nav aria-label="Help topics" className="lg:sticky lg:top-36 lg:h-fit">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-saffron">Customer care</p>
        <ul className="flex flex-wrap gap-1 lg:flex-col">
          {nav.map((n) => (
            <li key={n.slug}>
              <Link to="/help/$slug" params={{ slug: n.slug }} className={cn('block rounded-lg px-3 py-2 text-sm', n.slug === slug ? 'bg-emerald-900 font-semibold text-ivory' : 'hover:bg-sand')}>{n.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <article>
        <h1 className="font-display text-4xl font-semibold text-emerald-950 md:text-5xl">{data.title}</h1>
        {data.kind === 'faq' ? (
          <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed text-ink/75">{f.a}</p>
              </details>
            ))}
          </div>
        ) : (
          <>
            <p className="mt-4 text-lg text-ink/75">{data.page.intro}</p>
            <div className="mt-8 space-y-8">
              {data.page.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="font-display text-2xl font-semibold">{s.heading}</h2>
                  <p className="mt-2 leading-relaxed text-ink/75">{s.body}</p>
                </section>
              ))}
            </div>
          </>
        )}
        <div className="mt-12 rounded-3xl bg-sand p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">Still need help?</p>
            <p className="text-sm text-muted">Our team replies on WhatsApp, {store.hours}.</p>
          </div>
          <a href={whatsappLink('Hi! I need help with ')} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-ivory hover:bg-emerald-800 sm:mt-0">Chat on WhatsApp</a>
        </div>
      </article>
    </div>
  )
}
