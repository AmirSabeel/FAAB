'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  CheckCircle,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  description?: string;
}

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Ivory', hex: '#f5f0e8' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Burgundy', hex: '#722f37' },
  { name: 'Charcoal', hex: '#36454f' },
] as const;

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;

const FEATURES = [
  'Free shipping on orders over ₹16,600',
  '30-day hassle-free returns',
  'Premium quality guaranteed',
  'Gift wrapping available',
] as const;

// ─── Animation Variants ──────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.round(rating)
              ? 'text-gold fill-gold'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="absolute top-4 left-4 z-10 gradient-gold text-white text-xs font-semibold px-3 py-1 rounded-full">
      Save {percent}%
    </span>
  );
}

// ─── Panel Content (keyed by product.id to auto-reset state) ─────────────────

function QuickViewPanel({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2); // "M"
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = useCallback(() => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, []);

  const handleWishlist = useCallback(() => {
    setWishlisted((prev) => !prev);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(99, prev + 1));
  }, []);

  const discountPercent =
    product.originalPrice && product.price < product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative bg-background rounded-3xl shadow-luxury-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-foreground/10 transition-colors duration-200"
        aria-label="Close quick view"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* ─── Left: Image Section ─────────────────────────────────────── */}
        <div className="relative group aspect-square md:aspect-auto md:h-full bg-muted overflow-hidden">
          {discountPercent > 0 && <DiscountBadge percent={discountPercent} />}
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* ─── Right: Content Section ──────────────────────────────────── */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[60vh] md:max-h-[90vh] no-scrollbar"
        >
          {/* 1. Brand Tag */}
          <motion.p
            variants={itemVariants}
            className="text-xs text-gold font-medium tracking-[0.2em] uppercase"
          >
            FAAB Exclusive
          </motion.p>

          {/* 2. Product Name */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-3xl font-semibold tracking-tight"
          >
            {product.name}
          </motion.h2>

          {/* 3. Rating Row */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 flex-wrap"
          >
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount})
            </span>
            <button className="text-xs text-muted-foreground underline hover:text-foreground transition-colors cursor-pointer">
              Write a Review
            </button>
          </motion.div>

          {/* 4. Price */}
          <motion.div variants={itemVariants} className="flex items-baseline">
            <span className="text-2xl font-semibold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && discountPercent > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through ml-2">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gold font-medium ml-2">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </motion.div>

          {/* 5. Description */}
          <motion.p
            variants={itemVariants}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {product.description ||
              'Meticulously crafted with premium materials and exceptional attention to detail. This piece embodies the timeless elegance and refined sophistication that defines the FAAB collection, designed for those who appreciate the finer things.'}
          </motion.p>

          {/* 6. Color Selection */}
          <motion.div variants={itemVariants} className="space-y-3">
            <span className="text-sm font-medium">Color</span>
            <div className="flex items-center gap-3">
              {COLORS.map((color, idx) => (
                <motion.button
                  key={color.name}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(idx)}
                  className={cn(
                    'w-8 h-8 rounded-full cursor-pointer transition-all',
                    idx === selectedColor
                      ? 'border-foreground ring-2 ring-offset-2 ring-foreground border-2'
                      : 'border-2 border-transparent hover:border-foreground/20'
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name}`}
                  title={color.name}
                />
              ))}
            </div>
          </motion.div>

          {/* 7. Size Selection */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium">Size</span>
              <button className="text-xs text-muted-foreground underline ml-auto hover:text-foreground transition-colors cursor-pointer">
                Size Guide
              </button>
            </div>
            <div className="flex items-center gap-2">
              {SIZES.map((size, idx) => (
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

          {/* 8. Quantity + Add to Cart */}
          <motion.div variants={itemVariants} className="flex gap-3 mt-2">
            {/* Quantity Control */}
            <div className="flex items-center border border-border rounded-2xl">
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

            {/* Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={cn(
                'flex-1 py-3 rounded-2xl font-medium text-sm btn-ripple flex items-center justify-center gap-2 transition-colors duration-300 cursor-pointer',
                addedToCart
                  ? 'bg-gold text-white'
                  : 'bg-foreground text-background hover:bg-gold hover:text-white'
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
                  Add to Bag
                </>
              )}
            </motion.button>
          </motion.div>

          {/* 9. Wishlist Button */}
          <motion.button
            variants={itemVariants}
            whileTap={{ scale: 0.97 }}
            onClick={handleWishlist}
            className={cn(
              'w-full py-3 rounded-2xl border font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer',
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

          {/* 10. Features List */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
          >
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function QuickViewModal({
  isOpen,
  onClose,
  product,
}: QuickViewModalProps) {
  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          key="quick-view-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${product.name}`}
        >
          <QuickViewPanel key={product.id} product={product} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { Product, QuickViewModalProps };