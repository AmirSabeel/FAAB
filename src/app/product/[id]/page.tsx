'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingBag,
  Check,
  Minus,
  Plus,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProductById, getRelatedProducts } from '@/data/products'
import ProductCard from '@/components/product-card'
import { useCartStore } from '@/components/cart-drawer'
import { useWishlistStore } from '@/components/wishlist-store'
import { toast } from 'sonner'

// ─── API product shape ───────────────────────────────────────────────────

interface ApiProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  images: string[]
  category: string
  rating: number
  reviewCount: number
  stock: number
  isNew: boolean
  isFeatured: boolean
  sizes: string[]
  colors: { name: string; hex: string }[]
}

interface ApiRelatedItem {
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

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  'Free shipping on orders over ₹16,600',
  '30-day hassle-free returns',
  'Premium quality guaranteed',
  'Gift wrapping available',
] as const

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < Math.round(rating)
              ? 'text-gold fill-gold'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  )
}

// ─── Loading State ───────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-[3/4] rounded-3xl bg-muted animate-pulse" />
          <div className="space-y-5">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-20 w-full bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-11 w-11 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-12 w-full bg-muted rounded-2xl animate-pulse" />
            <div className="h-12 w-full bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string

  // ── State ──
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null)
  const [apiRelated, setApiRelated] = useState<ApiRelatedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [apiError, setApiError] = useState(false)

  // Stores
  const addItem = useCartStore((s) => s.addItem)
  const wishlistToggleItem = useWishlistStore((s) => s.toggleItem)
  const isWishlisted = useWishlistStore((s) => s.isInWishlist)

  // ── Fetch from API ──
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setApiError(false)

    Promise.all([
      fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/products/related?id=${id}&limit=4`).then((r) => r.json()),
    ])
      .then(([product, related]) => {
        if (cancelled) return
        if (product) {
          setApiProduct(product)
          setApiRelated(related.products || [])
        } else {
          setApiError(true)
        }
      })
      .catch(() => {
        if (!cancelled) setApiError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  // Scroll to top on mount / id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Reset selections when product changes
  useEffect(() => {
    setSelectedImage(0)
    setSelectedColor(0)
    setSelectedSize(0)
    setQuantity(1)
    setAddedToCart(false)
  }, [id])

  // ── Determine data source ──
  const staticProduct = getProductById(id)
  const staticRelated = getRelatedProducts(id)

  const product = apiProduct || staticProduct
  const relatedProducts = apiRelated.length > 0
    ? apiRelated.map((rp) => ({
        ...rp,
        badge: rp.originalPrice
          ? `-${Math.round(((rp.originalPrice - rp.price) / rp.originalPrice) * 100)}%`
          : undefined,
      }))
    : staticRelated

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-xl font-medium text-muted-foreground">
          Product not found
        </p>
        <Link
          href="/"
          className="gradient-gold text-white px-6 py-3 rounded-2xl font-medium hover:shadow-luxury-lg transition-all"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  if (loading) return <ProductDetailSkeleton />

  // ── Derived values ──
  const images = product.images.length > 0 ? product.images : [product.image]
  const sizes = product.sizes.length > 0 ? product.sizes : ['One Size']
  const colors = product.colors.length > 0 ? product.colors : []

  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = useCallback(() => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      size: sizes[selectedSize],
      color: colors[selectedColor]?.name,
    })
    setAddedToCart(true)
    toast.success('Added to cart', {
      description: `${product.name}${sizes[selectedSize] !== 'One Size' ? ` (${sizes[selectedSize]})` : ''}`,
      duration: 2000,
    })
    setTimeout(() => setAddedToCart(false), 1500)
  }, [product, addItem, selectedSize, selectedColor, images, sizes, colors])

  const handleWishlist = useCallback(() => {
    wishlistToggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
    })
  }, [product, wishlistToggleItem, images])

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }, [])

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(99, prev + 1))
  }, [])

  const discountPercent =
    product.originalPrice && product.price < product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0

  const badge = product.originalPrice && product.price < product.originalPrice
    ? `-${discountPercent}%`
    : undefined

  return (
    <div className="min-h-screen bg-background">
      {/* ── Back Button (fixed) ── */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-foreground/10 transition-colors duration-200"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* ── API fallback notice ── */}
      {apiError && staticProduct && (
        <div className="fixed top-6 right-6 z-50">
          <div className="glass-card px-4 py-2 rounded-xl text-xs text-muted-foreground">
            Showing cached product data
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <motion.main
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* ─── Left: Image Gallery ─────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] rounded-3xl overflow-hidden relative bg-muted">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {badge && (
                <span className="absolute top-4 left-4 gradient-gold text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                  {badge}
                </span>
              )}
              {product.isNew && !badge && (
                <span className="absolute top-4 left-4 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                  NEW
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'w-20 h-20 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-200',
                      idx === selectedImage
                        ? 'border-2 border-foreground ring-1 ring-foreground/20'
                        : 'border-2 border-transparent opacity-70 hover:opacity-100'
                    )}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Right: Product Info ──────────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:sticky lg:top-24 lg:self-start space-y-6"
          >
            {/* Category Tag */}
            <motion.p
              variants={staggerItem}
              className="text-xs text-gold font-medium tracking-[0.2em] uppercase"
            >
              {product.category}
            </motion.p>

            {/* Product Name */}
            <motion.h1
              variants={staggerItem}
              className="text-3xl md:text-4xl font-semibold tracking-tight"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div
              variants={staggerItem}
              className="flex items-center gap-2 flex-wrap"
            >
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount})
              </span>
              <button className="text-xs text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer">
                Write a Review
              </button>
            </motion.div>

            {/* Price */}
            <motion.div
              variants={staggerItem}
              className="flex items-baseline gap-3 flex-wrap"
            >
              <span className="text-2xl font-semibold">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && discountPercent > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gold font-medium">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </motion.div>

            {/* Description */}
            <motion.p
              variants={staggerItem}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {product.description}
            </motion.p>

            {/* Color Selection (only if colors exist) */}
            {colors.length > 0 && (
              <motion.div variants={staggerItem} className="space-y-3">
                <span className="text-sm font-medium">Color</span>
                <div className="flex items-center gap-3">
                  {colors.map((color, idx) => (
                    <motion.button
                      key={color.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(idx)}
                      className={cn(
                        'w-8 h-8 rounded-full cursor-pointer transition-all',
                        idx === selectedColor
                          ? 'ring-2 ring-offset-2 ring-foreground border-2 border-foreground'
                          : 'border-2 border-transparent hover:border-foreground/20'
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select ${color.name}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Size Selection */}
            <motion.div variants={staggerItem} className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium">Size</span>
                <button className="text-xs text-muted-foreground underline ml-auto hover:text-foreground transition-colors cursor-pointer">
                  Size Guide
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {sizes.map((size, idx) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSize(idx)}
                    className={cn(
                      'min-w-[44px] h-11 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer',
                      idx === selectedSize
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground/30'
                    )}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Quantity */}
            <motion.div variants={staggerItem}>
              <div className="flex items-center border border-border rounded-2xl w-fit">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 99}
                  className="w-11 h-11 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div variants={staggerItem}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-medium btn-ripple flex items-center justify-center gap-2 transition-colors duration-300 cursor-pointer',
                  addedToCart
                    ? 'gradient-gold text-white'
                    : 'gradient-gold text-white hover:shadow-luxury-lg'
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Wishlist Button */}
            <motion.div variants={staggerItem}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleWishlist}
                className={cn(
                  'w-full py-3 rounded-2xl border font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  wishlisted
                    ? 'border-gold text-gold'
                    : 'border-border hover:border-gold hover:text-gold'
                )}
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-all duration-300',
                    wishlisted && 'fill-gold'
                  )}
                />
                {wishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
              </motion.button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
            >
              {FEATURES.map((feature) => (
                <motion.div
                  key={feature}
                  variants={staggerItem}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Related Products ──────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="mt-24 md:mt-32"
          >
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard
                  key={rp.id}
                  id={rp.id}
                  name={rp.name}
                  price={rp.price}
                  originalPrice={rp.originalPrice || undefined}
                  image={rp.image}
                  rating={rp.rating}
                  reviewCount={rp.reviewCount}
                  badge={rp.badge}
                  isNew={rp.isNew}
                />
              ))}
            </div>
          </motion.section>
        )}
      </motion.main>
    </div>
  )
}