import { Link } from '@tanstack/react-router'
import { Mail, MapPin, Phone } from 'lucide-react'
import { store, whatsappLink } from '@/config/store'
import { categories } from '@/data/catalog'
import { Logo } from './Logo'

const social = [
  { label: 'Facebook', href: store.socials.facebook, path: 'M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9H17l.5-4h-4V8.8c0-.5.3-.8.5-.8z' },
  { label: 'Instagram', href: store.socials.instagram, path: 'M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.3 5.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM12 2.5c-2.6 0-2.9 0-3.9.1-3.5.2-5.4 2.1-5.6 5.6-.1 1-.1 1.3-.1 3.8s0 2.9.1 3.9c.2 3.5 2.1 5.4 5.6 5.6 1 .1 1.3.1 3.9.1s2.9 0 3.9-.1c3.5-.2 5.4-2.1 5.6-5.6.1-1 .1-1.3.1-3.9s0-2.8-.1-3.8c-.2-3.5-2.1-5.4-5.6-5.6-1-.1-1.3-.1-3.9-.1z' },
  { label: 'TikTok', href: store.socials.tiktok, path: 'M16.6 5.8A4.3 4.3 0 0115.5 3h-3.1v12.4a2.6 2.6 0 11-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 104.9 5.7V9.1a7.3 7.3 0 004.3 1.4V7.4a4.3 4.3 0 01-3.2-1.6z' },
  { label: 'YouTube', href: store.socials.youtube, path: 'M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3z' },
]

export function Footer() {
  const heading = 'mb-4 text-xs font-bold uppercase tracking-[0.2em] text-saffron'
  const link = 'text-sm text-ivory/70 transition hover:text-ivory'
  return (
    <footer className="mt-24 bg-emerald-950 text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:px-6">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/70">{store.description}</p>
          <div className="mt-6 flex gap-2">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 transition hover:border-saffron hover:bg-saffron hover:text-emerald-950"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" aria-hidden="true"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className={heading}>Shop</h3>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}><Link to="/shop" search={{ category: c.slug }} className={link}>{c.name}</Link></li>
            ))}
            <li><Link to="/shop" search={{ sale: true }} className={link}>Sale</Link></li>
          </ul>
        </div>
        <div>
          <h3 className={heading}>Customer care</h3>
          <ul className="space-y-2.5">
            <li><Link to="/help/$slug" params={{ slug: 'faq' }} className={link}>FAQs</Link></li>
            <li><Link to="/help/$slug" params={{ slug: 'shipping-policy' }} className={link}>Shipping Policy</Link></li>
            <li><Link to="/help/$slug" params={{ slug: 'return-policy' }} className={link}>Returns & Refunds</Link></li>
            <li><Link to="/help/$slug" params={{ slug: 'privacy-policy' }} className={link}>Privacy Policy</Link></li>
            <li><Link to="/help/$slug" params={{ slug: 'terms' }} className={link}>Terms & Conditions</Link></li>
            <li><a href={whatsappLink('Hi! I would like to track my order. Order number: ')} target="_blank" rel="noopener noreferrer" className={link}>Track order on WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h3 className={heading}>Contact</h3>
          <ul className="space-y-3 text-sm text-ivory/70">
            <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0 text-saffron" /><a href={`tel:${store.phone.replace(/\s/g, '')}`} className="hover:text-ivory">{store.phone}</a></li>
            <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 shrink-0 text-saffron" /><a href={`mailto:${store.email}`} className="hover:text-ivory">{store.email}</a></li>
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-saffron" /><span>{store.address}</span></li>
            <li className="text-xs text-ivory/50">{store.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ivory/50 sm:flex-row lg:px-6">
          <p>© {new Date().getFullYear()} {store.name}. All prices in PKR.</p>
          <div className="flex flex-wrap items-center gap-2">
            {['Cash on Delivery', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Visa / Mastercard'].map((m) => (
              <span key={m} className="rounded-md border border-ivory/15 px-2 py-1">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
