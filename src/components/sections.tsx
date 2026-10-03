'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/product-card';

/* ============================================================
   Fetch trending products from API
   ============================================================ */
interface TrendingProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
}

/* ============================================================
   ScrollReveal — reusable scroll-triggered fade-up wrapper
   ============================================================ */
function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   Section heading helper
   ============================================================ */
function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
      <div>
        <div className="relative inline-block">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <span className="absolute -bottom-1.5 left-0 h-0.5 w-12 rounded-full gradient-gold" />
        </div>
        {subtitle && (
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <a
          href={action.href}
          className="text-sm font-medium text-foreground hover:text-gold transition-colors duration-300 flex items-center gap-1 shrink-0"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </a>
      )}
    </ScrollReveal>
  );
}

/* ============================================================
   1. CategoriesSection
   ============================================================ */

interface CategoryData { id?: string; name: string; image: string; link: string }

const FALLBACK_CATEGORIES: CategoryData[] = [
  { name: "Women's Fashion", image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&q=80', link: "/shop?category=Women's Fashion" },
  { name: "Men's Fashion", image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=400&fit=crop&q=80', link: "/shop?category=Men's Fashion" },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80', link: '/shop?category=Accessories' },
  { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&q=80', link: '/shop?category=Footwear' },
  { name: 'Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80', link: '/shop?category=Accessories' },
  { name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&q=80', link: '/shop?category=Watches' },
  { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&q=80', link: '/shop?category=Jewelry' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80', link: "/shop?category=Women's Fashion" },
];

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryData[]>(FALLBACK_CATEGORIES)

  useEffect(() => {
    fetch('/api/homepage/categories')
      .then(r => r.json())
      .then((data: CategoryData[]) => {
        if (Array.isArray(data) && data.length > 0) setCategories(data)
      })
      .catch(() => { /* use fallback */ })
  }, [])

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading title="Shop by Category" />

        <ScrollReveal>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, idx) => (
              <motion.a
                key={cat.id || cat.name}
                href={cat.link || `/shop?category=${encodeURIComponent(cat.name)}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="min-w-[140px] md:min-w-[180px] rounded-3xl overflow-hidden group cursor-pointer shrink-0 block"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-0 left-0 right-0 text-white font-medium text-sm p-4">
                    {cat.name}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ============================================================
   2. FeaturedCollections
   ============================================================ */

interface CollectionData { id?: string; name: string; image: string; itemCount: number; link: string }

const FALLBACK_COLLECTIONS: CollectionData[] = [
  { name: 'Summer Essentials', itemCount: 12, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop&q=80', link: '/shop' },
  { name: 'Evening Wear', itemCount: 8, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&q=80', link: '/shop' },
  { name: 'Minimal Edit', itemCount: 15, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80', link: '/shop' },
];

export function FeaturedCollections() {
  const [collections, setCollections] = useState<CollectionData[]>(FALLBACK_COLLECTIONS)

  useEffect(() => {
    fetch('/api/homepage/collections')
      .then(r => r.json())
      .then((data: CollectionData[]) => {
        if (Array.isArray(data) && data.length > 0) setCollections(data)
      })
      .catch(() => { /* use fallback */ })
  }, [])

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title="Featured Collections"
          subtitle="Curated for the discerning eye"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col, idx) => (
            <ScrollReveal key={col.id || col.name} delay={idx * 0.12}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative rounded-3xl overflow-hidden group cursor-pointer h-[400px] md:h-[500px]"
              >
                <motion.div
                  initial={{ scale: 1.1, opacity: 0.8 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-white/70 text-sm mb-1">
                    {col.itemCount} items
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                    {col.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Explore Collection
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3. TrendingProducts — fetched from /api/trending
   ============================================================ */

interface TrendingProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  category?: string;
  description?: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  isNew?: boolean;
}

const TRENDING_CATEGORIES = [
  'All',
  "Women's Fashion",
  "Men's Fashion",
  'Accessories',
  'Footwear',
  'Watches',
  'Jewelry',
];

// Fallback data used when API returns empty (e.g. fresh install)
const FALLBACK_TRENDING: TrendingProductData[] = [
  {
    id: 'trend-1',
    name: 'Silk Blend Blazer',
    price: 40587,
    originalPrice: 58017,
    image:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&h=667&fit=crop&q=80',
    ],
    category: "Women's Fashion",
    description: 'A tailored silk blend blazer with satin lapels and refined structure.',
    rating: 4.8,
    reviewCount: 124,
    badge: '-30%',
  },
  {
    id: 'trend-2',
    name: 'Cashmere Sweater',
    price: 27307,
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=500&h=667&fit=crop&q=80',
    ],
    category: "Women's Fashion",
    description: 'Ultra-soft Mongolian cashmere knit with ribbed cuffs and hem.',
    rating: 4.9,
    reviewCount: 89,
    isNew: true,
  },
  {
    id: 'trend-3',
    name: 'Leather Tote Bag',
    price: 49717,
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Accessories',
    description: 'Full-grain Italian calfskin tote with spacious interior and gold hardware.',
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: 'trend-4',
    name: 'Minimal Watch',
    price: 20667,
    originalPrice: 28967,
    image:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Watches',
    description: 'Sleek sapphire glass timepiece with minimalist dial and mesh strap.',
    rating: 4.6,
    reviewCount: 203,
    badge: '-29%',
  },
  {
    id: 'trend-5',
    name: 'Linen Shirt',
    price: 15687,
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=667&fit=crop&q=80',
    ],
    category: "Men's Fashion",
    description: 'Breathable European linen shirt tailored for relaxed everyday luxury.',
    rating: 4.8,
    reviewCount: 67,
    isNew: true,
  },
  {
    id: 'trend-6',
    name: 'Designer Sunglasses',
    price: 23157,
    image:
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Accessories',
    description: 'Polarized UV400 lenses encased in hand-polished acetate frames.',
    rating: 4.5,
    reviewCount: 142,
  },
  {
    id: 'trend-7',
    name: 'Suede Ankle Boots',
    price: 37267,
    image:
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Footwear',
    description: 'Supple suede ankle boots featuring cushioned insoles and stacked heels.',
    rating: 4.7,
    reviewCount: 98,
    isNew: true,
  },
  {
    id: 'trend-8',
    name: 'Gold Chain Necklace',
    price: 16517,
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591477255-a20ec5533295?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Jewelry',
    description: '18k gold vermeil interlocking chain necklace designed to layer effortlessly.',
    rating: 4.9,
    reviewCount: 211,
  },
];

function computeBadge(price: number, originalPrice: number | null | undefined): string | undefined {
  if (originalPrice && originalPrice > price) {
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
    return `-${pct}%`;
  }
  return undefined;
}

export function TrendingProducts({
  onQuickView,
}: {
  onQuickView?: (product: TrendingProductData) => void;
}) {
  const [products, setProducts] = useState<TrendingProductData[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/trending')
      .then((r) => r.json())
      .then((data: TrendingProductData[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.map((p) => ({
              ...p,
              badge: computeBadge(p.price, p.originalPrice),
            }))
          );
        } else {
          setProducts(FALLBACK_TRENDING);
        }
      })
      .catch(() => {
        setProducts(FALLBACK_TRENDING);
      });
  }, []);

  const displayProducts = products.length > 0 ? products : FALLBACK_TRENDING;

  const filteredProducts =
    activeCategory === 'All'
      ? displayProducts
      : displayProducts.filter(
          (p) =>
            p.category?.toLowerCase().trim() === activeCategory.toLowerCase().trim() ||
            p.category?.toLowerCase().includes(activeCategory.toLowerCase().trim())
        );

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title="Trending Now"
          subtitle="Top styles handpicked for your wardrobe"
          action={{ label: 'View All Products', href: '/shop' }}
        />

        {/* Category Filter Pills */}
        <ScrollReveal>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
            {TRENDING_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === 'All'
                  ? displayProducts.length
                  : displayProducts.filter(
                      (p) =>
                        p.category?.toLowerCase().trim() === cat.toLowerCase().trim() ||
                        p.category?.toLowerCase().includes(cat.toLowerCase().trim())
                    ).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'relative px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 z-0',
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTrendingCategoryPill"
                      className="absolute inset-0 rounded-full gradient-gold -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums',
                        isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Products Grid with Smooth Transitions */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ProductCard
                  {...product}
                  onQuickView={onQuickView ? () => onQuickView(product) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   4. NewArrivals — fetched from /api/new-arrivals
   ============================================================ */

interface NewArrivalProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  category?: string;
  description?: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
}

const FALLBACK_NEW_ARRIVALS: NewArrivalProductData[] = [
  {
    id: 'new-1',
    name: 'Oversized Coat',
    price: 48887,
    image:
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&h=667&fit=crop&q=80',
    ],
    category: "Women's Fashion",
    description: 'Heavyweight double-faced wool coat with notched lapels and relaxed drape.',
    rating: 4.8,
    reviewCount: 34,
    isNew: true,
  },
  {
    id: 'new-2',
    name: 'Silk Scarf',
    price: 12367,
    image:
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Accessories',
    description: 'Pure Mulberry silk square scarf printed with contemporary artisan motifs.',
    rating: 4.9,
    reviewCount: 12,
    isNew: true,
  },
  {
    id: 'new-3',
    name: 'Wool Trousers',
    price: 22327,
    image:
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=667&fit=crop&q=80',
    ],
    category: "Men's Fashion",
    description: 'Pleated wool-blend trousers with high-rise waist and tapered silhouette.',
    rating: 4.7,
    reviewCount: 28,
    isNew: true,
  },
  {
    id: 'new-4',
    name: 'Canvas Sneakers',
    price: 16517,
    image:
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Footwear',
    description: 'Clean low-top canvas sneakers with vulcanized rubber sole and padded collar.',
    rating: 4.6,
    reviewCount: 45,
    isNew: true,
  },
  {
    id: 'new-5',
    name: 'Ceramic Watch',
    price: 32287,
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Watches',
    description: 'Scratch-resistant high-tech ceramic case with Swiss quartz movement.',
    rating: 4.8,
    reviewCount: 19,
    isNew: true,
  },
  {
    id: 'new-6',
    name: 'Leather Belt',
    price: 10707,
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=667&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=667&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&h=667&fit=crop&q=80',
    ],
    category: 'Accessories',
    description: 'Handcrafted bridle leather belt finished with brushed antique brass buckle.',
    rating: 4.5,
    reviewCount: 56,
    isNew: true,
  },
];

export function NewArrivals({
  onQuickView,
}: {
  onQuickView?: (product: NewArrivalProductData) => void;
}) {
  const [products, setProducts] = useState<NewArrivalProductData[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/new-arrivals')
      .then((r) => r.json())
      .then((data: NewArrivalProductData[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(FALLBACK_NEW_ARRIVALS);
        }
      })
      .catch(() => {
        setProducts(FALLBACK_NEW_ARRIVALS);
      });
  }, []);

  const displayProducts = products.length > 0 ? products : FALLBACK_NEW_ARRIVALS;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="relative inline-block">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                New Arrivals
              </h2>
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-12 rounded-full gradient-gold" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              The freshest silhouettes and newest arrivals in store
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full border border-border/80 flex items-center justify-center hover:bg-muted hover:border-gold transition-colors cursor-pointer text-foreground"
              aria-label="Scroll left"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full border border-border/80 flex items-center justify-center hover:bg-muted hover:border-gold transition-colors cursor-pointer text-foreground"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ScrollReveal>
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1"
          >
            {displayProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="min-w-[260px] md:min-w-[300px] shrink-0 snap-start"
              >
                <ProductCard
                  {...product}
                  onQuickView={onQuickView ? () => onQuickView(product) : undefined}
                />
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}