// ─── Central Product Catalog ──────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  rating: number
  reviewCount: number
  badge?: string
  isNew?: boolean
  category: string
  description: string
  sizes: string[]
  colors: { name: string; hex: string }[]
}

export const ALL_PRODUCTS: Product[] = [
  {
    id: 'trend-1',
    name: 'Silk Blend Blazer',
    price: 40587,
    originalPrice: 58017,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 124,
    badge: '-30%',
    category: "Women's Fashion",
    description: 'A refined silk blend blazer featuring a tailored silhouette with premium lining. Perfect for formal occasions and business meetings, this piece embodies timeless sophistication.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Charcoal', hex: '#36454f' },
    ],
  },
  {
    id: 'trend-2',
    name: 'Cashmere Sweater',
    price: 27307,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 89,
    isNew: true,
    category: "Women's Fashion",
    description: 'Luxuriously soft cashmere sweater crafted from the finest Mongolian cashmere. Features a relaxed fit with ribbed cuffs and hem for effortless elegance.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Ivory', hex: '#f5f0e8' },
      { name: 'Blush', hex: '#e8c4b8' },
      { name: 'Grey', hex: '#8a8a8a' },
    ],
  },
  {
    id: 'trend-3',
    name: 'Leather Tote Bag',
    price: 49717,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.7,
    reviewCount: 156,
    category: 'Accessories',
    description: 'Handcrafted from full-grain Italian leather, this spacious tote bag features interior compartments and gold-tone hardware. A timeless accessory for the modern woman.',
    sizes: ['One Size'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Tan', hex: '#d2a679' },
      { name: 'Burgundy', hex: '#722f37' },
    ],
  },
  {
    id: 'trend-4',
    name: 'Minimal Watch',
    price: 20667,
    originalPrice: 28967,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.6,
    reviewCount: 203,
    badge: '-29%',
    category: 'Watches',
    description: 'Swiss-made minimal watch with sapphire crystal glass and genuine leather strap. The clean dial design makes it versatile for any occasion.',
    sizes: ['One Size'],
    colors: [
      { name: 'Silver/Black', hex: '#c0c0c0' },
      { name: 'Rose Gold/Brown', hex: '#b76e53' },
    ],
  },
  {
    id: 'trend-5',
    name: 'Linen Shirt',
    price: 15687,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 67,
    isNew: true,
    category: "Men's Fashion",
    description: 'Premium European linen shirt with a relaxed fit. The natural fabric breathes beautifully, making it ideal for warm-weather sophistication.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Sky Blue', hex: '#87CEEB' },
      { name: 'Sand', hex: '#c2b280' },
    ],
  },
  {
    id: 'trend-6',
    name: 'Designer Sunglasses',
    price: 23157,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.5,
    reviewCount: 142,
    category: 'Accessories',
    description: 'Iconic designer sunglasses with UV400 protection and polarized lenses. The acetate frame ensures durability while maintaining a lightweight feel.',
    sizes: ['One Size'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Tortoise', hex: '#7a5230' },
      { name: 'Gold', hex: '#C5A55A' },
    ],
  },
  {
    id: 'trend-7',
    name: 'Suede Ankle Boots',
    price: 37267,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.7,
    reviewCount: 98,
    isNew: true,
    category: 'Footwear',
    description: 'Premium suede ankle boots with a comfortable block heel and leather sole. Handcrafted in Italy with meticulous attention to detail.',
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: [
      { name: 'Tan', hex: '#d2a679' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Grey', hex: '#8a8a8a' },
    ],
  },
  {
    id: 'trend-8',
    name: 'Gold Chain Necklace',
    price: 16517,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 211,
    category: 'Jewelry',
    description: '18K gold-plated chain necklace with a timeless link design. Hypoallergenic and tarnish-resistant, perfect for everyday luxury.',
    sizes: ['One Size'],
    colors: [
      { name: 'Gold', hex: '#C5A55A' },
      { name: 'Rose Gold', hex: '#b76e53' },
      { name: 'Silver', hex: '#c0c0c0' },
    ],
  },
  {
    id: 'new-1',
    name: 'Oversized Coat',
    price: 48887,
    image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 34,
    isNew: true,
    category: "Women's Fashion",
    description: 'An effortlessly chic oversized coat in premium wool blend. Features wide lapels and a belted waist for a flattering silhouette.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
  },
  {
    id: 'new-2',
    name: 'Silk Scarf',
    price: 12367,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 12,
    isNew: true,
    category: 'Accessories',
    description: 'Hand-printed silk scarf featuring an exclusive abstract design. The lightweight silk drapes beautifully and adds a touch of artistry to any outfit.',
    sizes: ['One Size'],
    colors: [
      { name: 'Multi', hex: '#e8a87c' },
      { name: 'Blue', hex: '#4a6fa5' },
    ],
  },
  {
    id: 'new-3',
    name: 'Wool Trousers',
    price: 22327,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.7,
    reviewCount: 28,
    isNew: true,
    category: "Men's Fashion",
    description: 'Tailored wool trousers with a modern slim fit. Features a concealed waistband extension and premium interior lining for all-day comfort.',
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Charcoal', hex: '#36454f' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Khaki', hex: '#c3b091' },
    ],
  },
  {
    id: 'new-4',
    name: 'Canvas Sneakers',
    price: 16517,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.6,
    reviewCount: 45,
    isNew: true,
    category: 'Footwear',
    description: 'Premium canvas sneakers with vulcanized rubber soles and cushioned insoles. A luxury take on the classic sneaker, designed for comfort and style.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1e3a5f' },
    ],
  },
  {
    id: 'new-5',
    name: 'Ceramic Watch',
    price: 32287,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 19,
    isNew: true,
    category: 'Watches',
    description: 'Scratch-resistant ceramic watch with a minimalist dial and Swiss quartz movement. The hypoallergenic ceramic band offers exceptional comfort.',
    sizes: ['One Size'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
  },
  {
    id: 'new-6',
    name: 'Leather Belt',
    price: 10707,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.5,
    reviewCount: 56,
    isNew: true,
    category: 'Accessories',
    description: 'Full-grain leather belt with a brushed metal buckle. The vegetable-tanned leather develops a beautiful patina over time.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Brown', hex: '#8b4513' },
      { name: 'Tan', hex: '#d2a679' },
    ],
  },
]

export const PRODUCT_CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  'Accessories',
  'Footwear',
  'Jewelry',
  'Watches',
] as const

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id)
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ALL_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  )
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId)
  if (!product) return ALL_PRODUCTS.slice(0, limit)
  return ALL_PRODUCTS.filter((p) => p.id !== productId && p.category === product.category).slice(0, limit)
}