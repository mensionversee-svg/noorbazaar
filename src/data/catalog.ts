/**
 * Catalog fixtures for the storefront.
 *
 * Everything the storefront displays comes from this one module so a later
 * milestone can replace these exports with Netlify Database queries
 * (see PLAN.md, Milestone 2) without touching the UI components.
 */

export interface Category {
  slug: string
  name: string
  blurb: string
  image: string
  subcategories: Array<{ slug: string; name: string }>
}

export interface VariantGroup {
  name: string
  options: Array<string>
}

export interface Product {
  id: number
  slug: string
  name: string
  brand: string
  category: string
  subcategory: string
  price: number
  compareAt?: number
  rating: number
  reviewCount: number
  stock: number
  sold: number
  createdAt: string
  image: string
  featured?: boolean
  shortDescription: string
  description: string
  highlights: Array<string>
  specs: Record<string, string>
  variants?: Array<VariantGroup>
}

export interface Review {
  productId: number
  author: string
  city: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
}

export interface Coupon {
  code: string
  description: string
  type: 'percent' | 'flat'
  value: number
  minSubtotal: number
}

export const categories: Array<Category> = [
  {
    slug: 'women',
    name: 'Women',
    blurb: 'Lawn, chiffon & festive wear',
    image: '/img/cat-women.png',
    subcategories: [
      { slug: 'unstitched', name: 'Unstitched' },
      { slug: 'shawls', name: 'Shawls & Dupattas' },
    ],
  },
  {
    slug: 'men',
    name: 'Men',
    blurb: 'Kurtas, shalwar kameez & more',
    image: '/img/cat-men.png',
    subcategories: [
      { slug: 'kurta', name: 'Kurta Shalwar' },
      { slug: 'wallets', name: 'Wallets & Leather' },
    ],
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    blurb: 'Audio, wearables & charging',
    image: '/img/cat-electronics.png',
    subcategories: [
      { slug: 'audio', name: 'Audio' },
      { slug: 'wearables', name: 'Wearables' },
      { slug: 'power', name: 'Power & Charging' },
    ],
  },
  {
    slug: 'home',
    name: 'Home & Kitchen',
    blurb: 'Handcrafted décor & appliances',
    image: '/img/cat-home.png',
    subcategories: [
      { slug: 'dining', name: 'Dining' },
      { slug: 'appliances', name: 'Appliances' },
      { slug: 'kitchenware', name: 'Kitchenware' },
      { slug: 'linen', name: 'Home Linen' },
      { slug: 'essentials', name: 'Home Essentials' },
    ],
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    blurb: 'Attars, skincare & self-care',
    image: '/img/cat-beauty.png',
    subcategories: [
      { slug: 'fragrance', name: 'Fragrance' },
      { slug: 'skincare', name: 'Skincare' },
    ],
  },
  {
    slug: 'accessories',
    name: 'Footwear & Accessories',
    blurb: 'Chappals, leather & more',
    image: '/img/cat-accessories.png',
    subcategories: [{ slug: 'footwear', name: 'Footwear' }],
  },
  {
    slug: 'fitness',
    name: 'Fitness & Sports',
    blurb: 'Gym gear, sports & supplements',
    image: 'https://static.markaz.app/pakistan/products/3344-396-MZ3344200001IBISMT-764389001-product-1.webp',
    subcategories: [],
  },
]

export const products: Array<Product> = [
  {
    id: 1,
    slug: 'embroidered-lawn-3-piece-mint',
    name: 'Embroidered Lawn 3-Piece — Mint Gold',
    brand: 'Noor Studio',
    category: 'women',
    subcategory: 'unstitched',
    price: 3999,
    compareAt: 5499,
    rating: 4.8,
    reviewCount: 214,
    stock: 38,
    sold: 1240,
    createdAt: '2026-09-28',
    image: '/img/p-lawn-suit.png',
    featured: true,
    shortDescription: 'Unstitched premium lawn with zari-embroidered neckline and printed chiffon dupatta.',
    description:
      'A summer essential reimagined. This three-piece unstitched suit pairs breathable premium lawn with delicate gold zari embroidery on the front and sleeves, finished with a printed chiffon dupatta that drapes beautifully. Perfect for Eid lunches, mehndi functions and everyday elegance.',
    highlights: ['Premium 80s lawn shirt (3m)', 'Printed chiffon dupatta (2.5m)', 'Dyed cambric trouser (2.5m)', 'Colour-fast dyes'],
    specs: { Fabric: 'Lawn / Chiffon / Cambric', Pieces: '3', 'Shirt length': '3 metres', Care: 'Gentle hand wash, dry in shade', Origin: 'Faisalabad, Pakistan' },
    variants: [{ name: 'Colour', options: ['Mint Gold', 'Blush Pink', 'Ivory'] }],
  },
  {
    id: 2,
    slug: 'mens-cotton-kurta-shalwar-ivory',
    name: 'Premium Cotton Kurta Shalwar — Ivory',
    brand: 'Noor Men',
    category: 'men',
    subcategory: 'kurta',
    price: 3499,
    rating: 4.6,
    reviewCount: 132,
    stock: 54,
    sold: 860,
    createdAt: '2026-09-10',
    image: '/img/p-kurta.png',
    featured: true,
    shortDescription: 'Soft wash-and-wear cotton with tonal collar embroidery. Ready to wear.',
    description:
      'Tailored from breathable wash-and-wear cotton, this stitched kurta shalwar features a classic band collar with subtle tonal embroidery. A relaxed fit keeps you comfortable from Jummah prayers to evening dawats.',
    highlights: ['Stitched & ready to wear', 'Wash-and-wear cotton', 'Tonal collar embroidery', 'Two side pockets'],
    specs: { Fabric: 'Cotton wash-and-wear', Fit: 'Regular', Pieces: 'Kurta + Shalwar', Care: 'Machine wash cold' },
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] }],
  },
  {
    id: 3,
    slug: 'wireless-earbuds-pro-anc',
    name: 'AirTune Pro Wireless Earbuds (ANC)',
    brand: 'AirTune',
    category: 'electronics',
    subcategory: 'audio',
    price: 4499,
    compareAt: 6999,
    rating: 4.5,
    reviewCount: 389,
    stock: 120,
    sold: 2310,
    createdAt: '2026-08-15',
    image: '/img/p-earbuds.png',
    featured: true,
    shortDescription: 'Active noise cancellation, 30-hour battery and low-latency gaming mode.',
    description:
      'Block out the traffic on Shahrah-e-Faisal. AirTune Pro delivers punchy bass, active noise cancellation and crystal-clear calls with four microphones. The pocket-size case provides up to 30 hours of total playback and charges over USB-C.',
    highlights: ['Hybrid ANC up to 35dB', '30h battery with case', 'Bluetooth 5.3', 'IPX5 sweat resistant'],
    specs: { Connectivity: 'Bluetooth 5.3', Battery: '7h buds / 30h total', Charging: 'USB-C', Warranty: '1 year brand warranty' },
    variants: [{ name: 'Colour', options: ['Matte Black', 'Pearl White'] }],
  },
  {
    id: 4,
    slug: 'smartwatch-series-5-rose-gold',
    name: 'Pulse Series 5 Smartwatch',
    brand: 'Pulse',
    category: 'electronics',
    subcategory: 'wearables',
    price: 6999,
    compareAt: 8999,
    rating: 4.4,
    reviewCount: 176,
    stock: 6,
    sold: 940,
    createdAt: '2026-10-02',
    image: '/img/p-smartwatch.png',
    featured: true,
    shortDescription: '1.9" AMOLED display, Bluetooth calling, heart-rate & SpO2 tracking.',
    description:
      'A bright AMOLED display, Bluetooth calling and 100+ workout modes make Pulse Series 5 the everyday companion. Track sleep, heart rate and SpO2, get WhatsApp notifications on your wrist, and go up to 7 days between charges.',
    highlights: ['1.9" AMOLED always-on display', 'Bluetooth calling', '100+ sport modes', 'Up to 7-day battery'],
    specs: { Display: '1.9" AMOLED', 'Water resistance': 'IP68', Battery: 'Up to 7 days', Compatibility: 'Android & iOS', Warranty: '1 year' },
    variants: [{ name: 'Colour', options: ['Rose Gold', 'Midnight', 'Silver'] }],
  },
  {
    id: 5,
    slug: 'handcrafted-peshawari-chappal-brown',
    name: 'Handcrafted Peshawari Chappal',
    brand: 'Qissa Khwani',
    category: 'accessories',
    subcategory: 'footwear',
    price: 3999,
    rating: 4.9,
    reviewCount: 98,
    stock: 22,
    sold: 610,
    createdAt: '2026-07-20',
    image: '/img/p-chappal.png',
    shortDescription: 'Genuine cow leather, hand-stitched by artisans in Peshawar.',
    description:
      'Made by master craftsmen in Peshawar using full-grain cow leather and traditional hand stitching. A cushioned footbed and double-layered sole make these chappals as comfortable as they are timeless.',
    highlights: ['Full-grain cow leather', 'Hand-stitched in Peshawar', 'Cushioned footbed', 'Tyre-rubber sole'],
    specs: { Material: 'Genuine leather', Sole: 'Rubber', Origin: 'Peshawar, Pakistan', Care: 'Wipe with damp cloth' },
    variants: [{ name: 'Size', options: ['7', '8', '9', '10', '11'] }],
  },
  {
    id: 6,
    slug: 'multani-blue-pottery-dinner-set',
    name: 'Multani Blue Pottery Dinner Set (18 pcs)',
    brand: 'Kashi Craft',
    category: 'home',
    subcategory: 'dining',
    price: 7499,
    compareAt: 8999,
    rating: 4.7,
    reviewCount: 64,
    stock: 9,
    sold: 210,
    createdAt: '2026-09-18',
    image: '/img/p-dinner-set.png',
    featured: true,
    shortDescription: 'Hand-painted Kashi Kari ceramics from Multan — a centrepiece for every dawat.',
    description:
      'Each piece is hand-painted by Multani artisans in the centuries-old Kashi Kari tradition. The 18-piece set includes dinner plates, quarter plates and bowls for six, glazed for everyday use and safe for the dishwasher.',
    highlights: ['18 pieces, serves 6', 'Hand-painted Kashi Kari', 'Lead-free glaze', 'Dishwasher safe'],
    specs: { Pieces: '18', Material: 'Ceramic', Origin: 'Multan, Pakistan', Microwave: 'Safe (no metallic trim)' },
  },
  {
    id: 7,
    slug: 'rose-oud-attar-12ml',
    name: 'Rose & Oud Attar — 12ml',
    brand: 'Itr-e-Noor',
    category: 'beauty',
    subcategory: 'fragrance',
    price: 2499,
    rating: 4.7,
    reviewCount: 241,
    stock: 70,
    sold: 1780,
    createdAt: '2026-06-30',
    image: '/img/p-attar.png',
    shortDescription: 'Alcohol-free concentrated perfume oil with Taif rose and aged oud.',
    description:
      'A rich, long-lasting attar blending Taif rose with smoky aged oud and a whisper of saffron. Alcohol-free and concentrated — a single swipe lasts all day. Presented in a hand-cut crystal bottle, ideal as a gift.',
    highlights: ['Alcohol-free', '12+ hour longevity', 'Crystal bottle', 'Gift-ready box'],
    specs: { Volume: '12ml', Notes: 'Rose, Oud, Saffron', Type: 'Perfume oil (attar)' },
    variants: [{ name: 'Size', options: ['6ml', '12ml', '24ml'] }],
  },
  {
    id: 8,
    slug: 'embroidered-pashmina-shawl-maroon',
    name: 'Embroidered Pashmina Shawl — Maroon',
    brand: 'Noor Studio',
    category: 'women',
    subcategory: 'shawls',
    price: 5499,
    compareAt: 6499,
    rating: 4.8,
    reviewCount: 87,
    stock: 0,
    sold: 430,
    createdAt: '2026-10-05',
    image: '/img/p-shawl.png',
    shortDescription: 'Soft pashmina blend with intricate paisley needlework.',
    description:
      'Wrap yourself in winter warmth with this pashmina-blend shawl featuring intricate paisley needlework along the borders. Lightweight, incredibly soft and finished with hand-knotted fringe.',
    highlights: ['Pashmina wool blend', 'Paisley needlework', 'Hand-knotted fringe', '1m × 2m'],
    specs: { Material: 'Pashmina wool blend', Size: '100 × 200 cm', Care: 'Dry clean only' },
  },
  {
    id: 9,
    slug: 'stainless-electric-kettle-1-7l',
    name: 'Stainless Steel Electric Kettle 1.7L',
    brand: 'HomeLine',
    category: 'home',
    subcategory: 'appliances',
    price: 3299,
    compareAt: 3999,
    rating: 4.3,
    reviewCount: 152,
    stock: 45,
    sold: 1020,
    createdAt: '2026-05-12',
    image: '/img/p-kettle.png',
    shortDescription: 'Boils 1.7 litres in under 4 minutes — chai is never far away.',
    description:
      'A 2200W fast-boil kettle with brushed stainless steel body, auto shut-off and boil-dry protection. The 360° cordless base and wide lid make it easy to fill and clean.',
    highlights: ['2200W fast boil', 'Auto shut-off', '360° cordless base', 'BPA-free'],
    specs: { Capacity: '1.7 L', Power: '2200W', Voltage: '220–240V', Warranty: '1 year' },
  },
  {
    id: 10,
    slug: 'slim-leather-bifold-wallet-tan',
    name: 'Slim Leather Bifold Wallet — Tan',
    brand: 'Noor Men',
    category: 'men',
    subcategory: 'wallets',
    price: 1999,
    compareAt: 2499,
    rating: 4.6,
    reviewCount: 203,
    stock: 80,
    sold: 1530,
    createdAt: '2026-04-02',
    image: '/img/p-wallet.png',
    shortDescription: 'Genuine leather with RFID blocking and 8 card slots.',
    description:
      'Crafted in Sialkot from genuine top-grain leather, this slim bifold keeps your essentials organised without the bulk. RFID-blocking lining protects your cards.',
    highlights: ['Top-grain leather', 'RFID blocking', '8 card slots', 'Gift box included'],
    specs: { Material: 'Top-grain leather', Dimensions: '11.5 × 9 cm', Origin: 'Sialkot, Pakistan' },
    variants: [{ name: 'Colour', options: ['Tan', 'Black', 'Brown'] }],
  },
  {
    id: 11,
    slug: 'herbal-skincare-gift-set',
    name: 'Herbal Glow Skincare Set (3 pcs)',
    brand: 'Sandal & Saffron',
    category: 'beauty',
    subcategory: 'skincare',
    price: 2999,
    compareAt: 3799,
    rating: 4.5,
    reviewCount: 118,
    stock: 31,
    sold: 720,
    createdAt: '2026-09-25',
    image: '/img/p-skincare.png',
    shortDescription: 'Face wash, toner & serum with saffron, neem and aloe vera.',
    description:
      'A gentle three-step routine made with saffron, neem and aloe vera. Cleanses, balances and brightens without harsh chemicals — suitable for all skin types and Pakistan’s humid summers.',
    highlights: ['Paraben-free', 'Cruelty-free', 'All skin types', 'Made in Pakistan'],
    specs: { Includes: 'Face wash 100ml, Toner 100ml, Serum 30ml', 'Skin type': 'All' },
  },
  {
    id: 12,
    slug: 'power-bank-20000mah-pd',
    name: 'PowerMax 20000mAh Power Bank (22.5W)',
    brand: 'PowerMax',
    category: 'electronics',
    subcategory: 'power',
    price: 4299,
    rating: 4.4,
    reviewCount: 267,
    stock: 64,
    sold: 1890,
    createdAt: '2026-10-08',
    image: '/img/p-powerbank.png',
    shortDescription: 'Fast-charge through load-shedding with dual USB-C PD output.',
    description:
      'Stay charged through load-shedding and long journeys. 20000mAh capacity charges most phones four times over, with 22.5W fast charging and dual outputs so you can charge two devices at once.',
    highlights: ['20000mAh capacity', '22.5W PD fast charge', 'USB-C in/out', 'LED battery display'],
    specs: { Capacity: '20000mAh', Output: '22.5W max', Ports: '1× USB-C, 2× USB-A', Weight: '380g', Warranty: '6 months' },
    variants: [{ name: 'Colour', options: ['White', 'Black'] }],
  },
]

export const reviews: Array<Review> = [
  { productId: 1, author: 'Ayesha K.', city: 'Lahore', rating: 5, date: '2026-10-03', title: 'Beautiful embroidery', body: 'The fabric is so soft and the embroidery looks even better in person. Got so many compliments at my cousin’s mehndi!', verified: true },
  { productId: 1, author: 'Sana M.', city: 'Karachi', rating: 5, date: '2026-09-29', title: 'Exactly as pictured', body: 'Colour is true to the photo, delivery took only 2 days to Karachi. Will order the blush pink next.', verified: true },
  { productId: 1, author: 'Hira A.', city: 'Multan', rating: 4, date: '2026-09-21', title: 'Lovely dupatta', body: 'Chiffon dupatta is gorgeous. Trouser fabric could be slightly thicker but overall great value.', verified: true },
  { productId: 2, author: 'Bilal R.', city: 'Islamabad', rating: 5, date: '2026-09-30', title: 'Perfect fit', body: 'Ordered L and the fit is spot on. Fabric does not wrinkle much — great for Jummah.', verified: true },
  { productId: 2, author: 'Usman T.', city: 'Faisalabad', rating: 4, date: '2026-09-12', title: 'Good quality', body: 'Stitching is neat. Would love more colours.', verified: true },
  { productId: 3, author: 'Hamza S.', city: 'Rawalpindi', rating: 5, date: '2026-10-01', title: 'ANC is impressive', body: 'For this price the noise cancellation is really good. Battery easily lasts my whole week of commuting.', verified: true },
  { productId: 3, author: 'Zainab F.', city: 'Lahore', rating: 4, date: '2026-09-18', title: 'Great sound', body: 'Bass is strong and calls are clear. Case is a fingerprint magnet though.', verified: true },
  { productId: 4, author: 'Fatima N.', city: 'Karachi', rating: 4, date: '2026-10-06', title: 'Stylish and useful', body: 'Love the rose gold. WhatsApp notifications work perfectly with my phone.', verified: true },
  { productId: 5, author: 'Ali H.', city: 'Peshawar', rating: 5, date: '2026-08-22', title: 'Authentic Peshawari', body: 'Proper hand-made quality, just like the ones from Qissa Khwani Bazaar. Very comfortable.', verified: true },
  { productId: 6, author: 'Mehwish B.', city: 'Lahore', rating: 5, date: '2026-09-27', title: 'Stunning set', body: 'Packed very carefully, nothing broke. The hand-painted detail is beautiful.', verified: true },
  { productId: 7, author: 'Imran Q.', city: 'Hyderabad', rating: 5, date: '2026-08-11', title: 'Long lasting', body: 'One swipe lasts the whole day. Rose note is lovely without being too sweet.', verified: true },
  { productId: 12, author: 'Saad J.', city: 'Quetta', rating: 4, date: '2026-10-09', title: 'Lifesaver during load-shedding', body: 'Charges my phone 4 times. A bit heavy but expected for 20000mAh.', verified: true },
]

export const testimonials = [
  { name: 'Ayesha Khan', city: 'Lahore', quote: 'Ordered at night, delivered in two days with Cash on Delivery. The lawn quality is better than in-store brands.', rating: 5 },
  { name: 'Bilal Raza', city: 'Islamabad', quote: 'Genuinely helpful support on WhatsApp — they helped me pick the right size and exchanged it without any hassle.', rating: 5 },
  { name: 'Sana Mirza', city: 'Karachi', quote: 'My go-to for gifts. Packaging is premium and the prices are fair. Highly recommended!', rating: 5 },
]

// Coupons are validated client-side only until checkout moves to the server (PLAN.md, Milestone 5).
export const coupons: Array<Coupon> = [
  { code: 'WELCOME10', description: '10% off orders over Rs. 2,000', type: 'percent', value: 10, minSubtotal: 2000 },
  { code: 'FLAT500', description: 'Rs. 500 off orders over Rs. 5,000', type: 'flat', value: 500, minSubtotal: 5000 },
]

export const faqs = [
  { q: 'Do you offer Cash on Delivery?', a: 'Yes. Cash on Delivery is available in all cities across Pakistan. You pay the rider when your parcel arrives.' },
  { q: 'How long does delivery take?', a: 'Orders to Karachi, Lahore, Islamabad and Rawalpindi usually arrive in 2–3 working days. Other cities take 3–6 working days.' },
  { q: 'How much is shipping?', a: 'Shipping is free on orders above Rs. 3,000. Below that, a flat Rs. 250 delivery charge applies nationwide.' },
  { q: 'Can I return or exchange an item?', a: 'Unused items in original packaging can be returned or exchanged within 7 days of delivery. See our Return Policy for details.' },
  { q: 'Which payment methods do you accept?', a: 'Cash on Delivery today. Bank transfer, Easypaisa, JazzCash and debit/credit cards are being added with our secure checkout.' },
  { q: 'How can I track my order?', a: 'You’ll receive an order number by SMS/email once you order. Message us on WhatsApp with that number for a live update.' },
]

export interface InfoPage {
  slug: string
  title: string
  intro: string
  sections: Array<{ heading: string; body: string }>
}

export const infoPages: Array<InfoPage> = [
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    intro: 'We deliver to every city and town in Pakistan through trusted courier partners.',
    sections: [
      { heading: 'Delivery charges', body: 'Free delivery on all orders above Rs. 3,000. Orders below Rs. 3,000 carry a flat Rs. 250 delivery charge.' },
      { heading: 'Delivery times', body: 'Karachi, Lahore, Islamabad and Rawalpindi: 2–3 working days. All other cities: 3–6 working days. Remote areas may take slightly longer.' },
      { heading: 'Order processing', body: 'Orders placed before 3pm PKT on working days are dispatched the same day. You’ll receive a confirmation call or SMS before dispatch for Cash on Delivery orders.' },
    ],
  },
  {
    slug: 'return-policy',
    title: 'Return & Refund Policy',
    intro: 'Not happy with your purchase? We make returns and exchanges simple.',
    sections: [
      { heading: '7-day returns', body: 'Unused items in original packaging with tags attached can be returned within 7 days of delivery.' },
      { heading: 'Exchanges', body: 'Size and colour exchanges are free once per order, subject to availability.' },
      { heading: 'Refunds', body: 'Approved refunds are issued by bank transfer, Easypaisa or JazzCash within 5–7 working days after we receive the item.' },
      { heading: 'Non-returnable items', body: 'Opened fragrances, skincare and items marked as final sale cannot be returned for hygiene reasons.' },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    intro: 'Your privacy matters. This policy explains what we collect and why.',
    sections: [
      { heading: 'Information we collect', body: 'Name, phone number, email (optional) and delivery address — only what’s needed to process and deliver your order.' },
      { heading: 'How we use it', body: 'To fulfil orders, send order updates, and — only if you subscribe — share offers. We never sell your data.' },
      { heading: 'Payments', body: 'Card and wallet payments are processed by licensed payment providers. We never store your full card details.' },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    intro: 'By using this website you agree to the following terms.',
    sections: [
      { heading: 'Pricing', body: 'All prices are in Pakistani Rupees (PKR) and include applicable taxes. Prices and availability may change without notice.' },
      { heading: 'Orders', body: 'We reserve the right to cancel orders in case of pricing errors, stock unavailability or suspected fraud. You will be notified and fully refunded where applicable.' },
      { heading: 'Governing law', body: 'These terms are governed by the laws of the Islamic Republic of Pakistan.' },
    ],
  },
]

// ---- Query helpers (swap these for database queries later) ----

export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug)
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug)
export const getReviews = (productId: number) => reviews.filter((r) => r.productId === productId)
export const getRelated = (product: Product, limit = 4) =>
  [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, limit)

export const featuredProducts = () => products.filter((p) => p.featured)
export const bestSellers = (limit = 8) => [...products].sort((a, b) => b.sold - a.sold).slice(0, limit)
export const newArrivals = (limit = 8) =>
  [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
export const onSale = () =>
  products
    .filter((p) => p.compareAt && p.compareAt > p.price)
    .sort((a, b) => (b.compareAt! - b.price) / b.compareAt! - (a.compareAt! - a.price) / a.compareAt!)
