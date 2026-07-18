'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
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
  originalPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
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

const categories = [
  {
    name: "Women's Fashion",
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&q=80',
  },
  {
    name: "Men's Fashion",
    image:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=400&fit=crop&q=80',
  },
  {
    name: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80',
  },
  {
    name: 'Footwear',
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&q=80',
  },
  {
    name: 'Bags',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80',
  },
  {
    name: 'Watches',
    image:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&q=80',
  },
  {
    name: 'Jewelry',
    image:
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&q=80',
  },
  {
    name: 'Beauty',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading title="Shop by Category" />

        <ScrollReveal>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="min-w-[140px] md:min-w-[180px] rounded-3xl overflow-hidden group cursor-pointer shrink-0"
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
              </motion.div>
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

const collections = [
  {
    name: 'Summer Essentials',
    items: 12,
    image:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop&q=80',
  },
  {
    name: 'Evening Wear',
    items: 8,
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&q=80',
  },
  {
    name: 'Minimal Edit',
    items: 15,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80',
  },
];

export function FeaturedCollections() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title="Featured Collections"
          subtitle="Curated for the discerning eye"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col, idx) => (
            <ScrollReveal key={col.name} delay={idx * 0.12}>
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
                    {col.items} items
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

// Fallback data used when API returns empty (e.g. fresh install)
const FALLBACK_TRENDING = [
  {
    id: 'trend-1',
    name: 'Silk Blend Blazer',
    price: 40587,
    originalPrice: 58017,
    image:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=667&fit=crop&q=80',
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
    rating: 4.5,
    reviewCount: 142,
  },
  {
    id: 'trend-7',
    name: 'Suede Ankle Boots',
    price: 37267,
    image:
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=667&fit=crop&q=80',
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
    rating: 4.9,
    reviewCount: 211,
  },
];

function computeBadge(price: number, originalPrice: number | null): string | undefined {
  if (originalPrice && originalPrice > price) {
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100)
    return `-${pct}%`
  }
  return undefined
}

export function TrendingProducts() {
  const [products, setProducts] = useState<(TrendingProductData & { badge?: string })[]>([])

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
          )
        } else {
          // Use fallback when DB has no trending products
          setProducts(FALLBACK_TRENDING)
        }
      })
      .catch(() => {
        setProducts(FALLBACK_TRENDING)
      })
  }, [])

  const displayProducts = products.length > 0 ? products : FALLBACK_TRENDING

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title="Trending Now"
          action={{ label: 'View All', href: '#' }}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, idx) => (
            <ScrollReveal key={product.id} delay={idx * 0.06}>
              <ProductCard {...product} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   4. NewArrivals
   ============================================================ */

const newArrivals = [
  {
    id: 'new-1',
    name: 'Oversized Coat',
    price: 48887,
    image:
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500&h=667&fit=crop&q=80',
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
    rating: 4.5,
    reviewCount: 56,
    isNew: true,
  },
];

export function NewArrivals() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading title="New Arrivals" />

        <ScrollReveal>
          <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            {newArrivals.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="min-w-[260px] md:min-w-[300px] shrink-0 snap-start"
              >
                <ProductCard {...product} />
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}