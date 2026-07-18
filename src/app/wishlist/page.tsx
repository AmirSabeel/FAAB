'use client'

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  Check,
  SlidersHorizontal,
  ChevronDown,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useWishlistStore, type WishlistItem } from '@/components/wishlist-store'
import { useCartStore } from '@/components/cart-drawer'

// ─── Types & Helpers ──────────────────────────────────────────────────────

type SortOption = 'recent' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ─── Animation Variants ───────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 28, stiffness: 260, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -12,
    transition: { duration: 0.25 },
  },
}

// ─── Wishlist Product Card ────────────────────────────────────────────────

interface WishlistCardProps {
  item: WishlistItem
  onRemove: (id: string) => void
  onMoveToCart: (item: WishlistItem) => void
  addedToCart: boolean
}

function WishlistCard({ item, onRemove, onMoveToCart, addedToCart }: WishlistCardProps) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      exit="exit"
      className="bg-card rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-xl transition-all duration-500 group"
    >
      {/* Image */}
      <Link href={`/product/${item.id}`} className="block relative aspect-[3/4] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Remove overlay button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove(item.id)
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          aria-label={`Remove ${item.name} from wishlist`}
        >
          <X className="w-[18px] h-[18px] text-white" strokeWidth={2} />
        </motion.button>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <Link href={`/product/${item.id}`}>
          <h3 className="text-sm font-medium line-clamp-1 text-foreground hover:text-gold transition-colors">
            {item.name}
          </h3>
        </Link>

        <p className="text-lg font-semibold text-foreground">
          {formatPrice(item.price)}
        </p>

        {/* Add to Bag */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoveToCart(item)}
          disabled={addedToCart}
          className={cn(
            'w-full py-2.5 rounded-2xl font-medium text-sm btn-ripple transition-all duration-300',
            'flex items-center justify-center gap-2 cursor-pointer',
            addedToCart
              ? 'bg-gold text-white'
              : 'bg-foreground text-background hover:bg-gold hover:text-white'
          )}
        >
          {addedToCart ? (
            <>
              <Check className="w-4 h-4" />
              Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              Add to Bag
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────

function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-4"
    >
      {/* Heart icon with pulse ring */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="w-24 h-24 rounded-full bg-muted/80 flex items-center justify-center relative">
          <Heart className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Your wishlist is empty
      </h2>
      <p className="text-sm text-muted-foreground max-w-[320px] mb-8 leading-relaxed">
        Save your favourite pieces here so you can easily find them later. Tap the heart icon on any product to get started.
      </p>

      <Link
        href="/shop"
        className={cn(
          'inline-flex items-center gap-2 px-8 py-3 rounded-2xl',
          'gradient-gold text-white font-medium text-sm',
          'hover:shadow-luxury-lg transition-all duration-300 btn-ripple'
        )}
      >
        <ShoppingBag className="w-4 h-4" />
        Start Shopping
      </Link>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const mounted = useHydrated()

  const items = useWishlistStore((s) => s.items)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const clearAll = useWishlistStore((s) => s.setItems)
  const addItem = useCartStore((s) => s.addItem)

  const [sort, setSort] = useState<SortOption>('recent')
  const [sortOpen, setSortOpen] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  // Sorted items
  const sortedItems = useMemo(() => {
    const sorted = [...items]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'recent':
      default:
        sorted.sort((a, b) => b.addedAt - a.addedAt)
        break
    }
    return sorted
  }, [items, sort])

  // Total value of wishlist
  const totalValue = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items])

  // Move to cart handler
  const handleMoveToCart = useCallback(
    (item: WishlistItem) => {
      addItem({ id: item.id, name: item.name, price: item.price, image: item.image })
      setAddedIds((prev) => new Set(prev).add(item.id))
      toast.success('Added to bag', {
        description: item.name,
        duration: 2000,
      })
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev)
          next.delete(item.id)
          return next
        })
      }, 2000)
    },
    [addItem]
  )

  // Remove handler
  const handleRemove = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      removeItem(id)
      if (item) {
        toast('Removed from wishlist', {
          description: item.name,
          duration: 2000,
        })
      }
    },
    [items, removeItem]
  )

  // Clear all handler
  const handleClearAll = useCallback(() => {
    if (items.length === 0) return
    clearAll([])
    toast('Wishlist cleared', { duration: 2000 })
  }, [items.length, clearAll])

  // Share wishlist
  const handleShare = useCallback(async () => {
    const names = items.map((i) => `• ${i.name} — ${formatPrice(i.price)}`).join('\n')
    const text = `My FAAB Wishlist\n\n${names}\n\nShop now: ${window.location.origin}/shop`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My FAAB Wishlist', text })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Wishlist copied!', {
        description: 'Share it with your friends',
        duration: 2500,
      })
    } catch {
      toast.error('Could not copy wishlist')
    }
  }, [items])

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Recently Added'

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/50 h-16" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-3xl overflow-hidden shadow-luxury border border-border/50">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
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
            Wishlist
            {items.length > 0 && (
              <span className="ml-2 text-gold font-normal">
                ({items.length})
              </span>
            )}
          </h1>

          {/* Right actions */}
          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Share wishlist"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClearAll}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                aria-label="Clear all wishlist items"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Total value: <span className="font-semibold text-foreground">{formatPrice(totalValue)}</span>
              </p>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">{activeSortLabel}</span>
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', sortOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
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
                            onClick={() => {
                              setSort(option.value)
                              setSortOpen(false)
                            }}
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
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Products Grid ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onMoveToCart={handleMoveToCart}
                    addedToCart={addedIds.has(item.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* ── Move All to Bag ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sortedItems.forEach((item) => {
                    addItem({ id: item.id, name: item.name, price: item.price, image: item.image })
                  })
                  toast.success(`Added ${sortedItems.length} item${sortedItems.length !== 1 ? 's' : ''} to bag`, {
                    duration: 2500,
                  })
                }}
                className={cn(
                  'px-8 py-3.5 rounded-2xl gradient-gold',
                  'text-white font-medium text-sm btn-ripple',
                  'hover:shadow-luxury-lg transition-all',
                  'flex items-center gap-2 cursor-pointer'
                )}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                Add All to Bag
              </motion.button>

              <Link
                href="/shop"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground/50"
              >
                Continue Browsing
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}