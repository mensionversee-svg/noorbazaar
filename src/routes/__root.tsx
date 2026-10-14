import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { store } from '@/config/store'
import { ShopProvider } from '@/lib/shop'
import { AuthProvider } from '@/lib/auth'
import { LiveDataProvider } from '@/lib/live-data'
import { Toaster } from 'sonner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { WhatsAppButton } from '@/components/WhatsAppButton'

import '../styles.css'

const siteTitle = `${store.name} — ${store.tagline}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0f3d2e' },
      { title: siteTitle },
      { name: 'description', content: store.description },
      { property: 'og:site_name', content: store.name },
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: store.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_PK' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
        <LiveDataProvider>
        <ShopProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </ShopProvider>
        </LiveDataProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <p className="font-display text-7xl font-semibold text-saffron">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">This page went shopping</h1>
      <p className="mt-3 text-muted">We couldn’t find what you were looking for. Try our latest arrivals instead.</p>
      <Link to="/shop" className="mt-8 rounded-full bg-emerald-900 px-7 py-3.5 font-semibold text-ivory hover:bg-emerald-800">Browse the shop</Link>
    </div>
  )
}
