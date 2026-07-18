'use client'

import { useState, useEffect, useCallback, useSyncExternalStore, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ProductCard from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ───────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  category: string
  rating: number
  reviewCount: number
  isNew: boolean
  isFeatured: boolean
}

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

// ─── Constants ───────────────────────────────────────────────────────────

const CATEGORIES = ['All', "Women's Fashion", "Men's Fashion", 'Accessories', 'Footwear', 'Jewelry', 'Watches']

const CATEGORY_SHORT: Record<string, string> = {
  'All': 'All',
  "Women's Fashion": 'Women',
  "Men's Fashion": 'Men',
  'Accessories': 'Accessories',
  'Footwear': 'Footwear',
  'Jewelry': 'Jewelry',
  'Watches': 'Watches',
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'rating', label: 'Top Rated' },
]

const SALE_CATEGORIES = ["Women's Fashion", "Men's Fashion", 'Accessories']

// ─── Grid Skeleton ───────────────────────────────────────────────────────

function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-3xl overflow-hidden shadow-luxury border border-border/50">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="p-4 space-y-2.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mounted = useHydrated()

  const initialCategory = searchParams.get('category') || 'All'
  const initialSale = searchParams.get('sale') === 'true'

  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [gridCols, setGridCols] = useState<3 | 4>(4)
  const [sortOpen, setSortOpen] = useState(false)

  // Fetch products
  const fetchProducts = useCallback(async (cat: string, s: string, p: number, sale: boolean) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (cat && cat !== 'All') params.set('category', cat)
    if (sale) params.set('sale', 'true')
    else params.set('sort', s)
    params.set('page', String(p))
    params.set('limit', '24')

    try {
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(category, sort, page, initialSale)
  }, [category, sort, page, initialSale, fetchProducts])

  // Sync category from URL on mount
  useEffect(() => {
    const cat = searchParams.get('category') || 'All'
    setCategory(cat)
  }, [searchParams])

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setPage(1)
    // Update URL without full reload
    const params = new URLSearchParams()
    if (cat !== 'All') params.set('category', cat)
    if (initialSale) params.set('sale', 'true')
    router.replace(`/shop${params.toString() ? `?${params}` : ''}`, { scroll: false })
  }

  function handleSortChange(val: string) {
    setSort(val)
    setPage(1)
    setSortOpen(false)
  }

  // Active sort label
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Newest'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ── */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-sm font-semibold tracking-[0.2em] uppercase">
            {initialSale ? 'Sale' : category === 'All' ? 'Shop All' : CATEGORY_SHORT[category] || category}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGridCols(3)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
                gridCols === 3 ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              aria-label="3 column grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
                gridCols === 4 ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              aria-label="4 column grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* ── Category Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4">
          {(!initialSale ? CATEGORIES : SALE_CATEGORIES).map((cat) => {
            const isActive = category === cat
            return (
              <motion.button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border',
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {CATEGORY_SHORT[cat] || cat}
              </motion.button>
            )
          })}
        </div>

        {/* ── Results Bar ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : (
              <>{total} product{total !== 1 ? 's' : ''}</>
            )}
          </p>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{activeSortLabel}</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', sortOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl border border-border/50 shadow-luxury-lg p-2 z-50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer',
                        sort === option.value
                          ? 'bg-foreground/5 text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {option.label}
                      {sort === option.value && <Check className="w-4 h-4 text-gold" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Active Filters ── */}
        {category !== 'All' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="text-xs text-muted-foreground">Filter:</span>
            <button
              onClick={() => handleCategoryChange('All')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/5 text-sm font-medium hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              {CATEGORY_SHORT[category] || category}
              <span className="text-muted-foreground text-xs">×</span>
            </button>
          </motion.div>
        )}

        {/* ── Products Grid ── */}
        {loading ? (
          <GridSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Grid3X3 className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try a different category or check back later
            </p>
            <button
              onClick={() => handleCategoryChange('All')}
              className="mt-4 px-6 py-2.5 rounded-2xl gradient-gold text-white text-sm font-medium btn-ripple cursor-pointer"
            >
              View All Products
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={cn(
              'grid gap-4 md:gap-6',
              gridCols === 3
                ? 'grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            )}
          >
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3), ease: 'easeOut' }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice || undefined}
                    image={product.image}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    badge={product.isFeatured ? 'Featured' : undefined}
                    isNew={product.isNew}
                    onQuickView={() => router.push(`/product/${product.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer disabled:hover:bg-transparent"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-10 h-10 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                    p === page
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer disabled:hover:bg-transparent"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ShopPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 h-16" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <GridSkeleton count={12} />
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageContent />
    </Suspense>
  )
}