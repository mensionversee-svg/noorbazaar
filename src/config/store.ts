// Central store branding & business settings. Change these to rebrand the shop.
export const store = {
  name: 'Noor Bazaar',
  tagline: 'Pakistan’s curated online store',
  description:
    'Shop authentic Pakistani fashion, handcrafted accessories, home essentials and the latest gadgets — delivered nationwide with Cash on Delivery.',
  // International format without "+" — used for wa.me links. Replace with the real business number.
  whatsappNumber: '923098329970',
  phone: '+92 309 8329970',
  email: 'support@noorbazaar.pk',
  address: 'Office 12, Gulberg III, Lahore, Punjab, Pakistan',
  hours: 'Mon–Sat, 10am – 8pm PKT',
  socials: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/',
    youtube: 'https://youtube.com/',
  },
  shipping: {
    freeThreshold: 3000,
    standardFee: 250,
    majorCities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
    majorCityDays: '2–3 working days',
    otherCityDays: '3–6 working days',
  },
  hero: {
    badge: 'Autumn Edit 2026',
    title: 'Crafted in Pakistan. Delivered to your door.',
    subtitle: 'Embroidered lawn, handmade chappals, Multani pottery and everyday tech — curated for you, with Cash on Delivery nationwide.',
    image: '/img/hero.png',
  },
  announcements: [
    'Free nationwide delivery on orders above Rs. 3,000',
    'Cash on Delivery available across Pakistan',
    'Use code WELCOME10 for 10% off your first order',
  ],
}

export const whatsappLink = (text?: string) =>
  `https://wa.me/${store.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`
