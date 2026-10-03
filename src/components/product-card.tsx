'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/components/cart-drawer';
import { useWishlistStore } from '@/components/wishlist-store';
import { useProductOverridesStore } from '@/hooks/use-product-overrides';

interface ProductCardProps {
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
  onQuickView?: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5',
            i < Math.round(rating)
              ? 'text-gold fill-gold'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  images,
  category,
  description,
  rating,
  reviewCount,
  badge,
  isNew,
  onQuickView,
}: ProductCardProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const overrides = useProductOverridesStore((s) => s.overrides);
  const override = overrides[name.toLowerCase().trim()] || overrides[id];

  const displayPrice = override?.price !== undefined ? override.price : price;
  const displayOriginalPrice = override?.originalPrice !== undefined ? override.originalPrice : originalPrice;
  const displayImage = override?.image || image;
  const displayName = override?.name || name;

  // Multi-image hover support
  const secondaryImage = images && images.length > 1 && images[1] !== displayImage ? images[1] : null;

  // ── Real store connections ──
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.isInWishlist(id));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist({ id, name: displayName, price: displayPrice, image: displayImage });
      if (!wishlisted) {
        toast.success('Added to wishlist', {
          description: displayName,
          duration: 2000,
        });
      }
    },
    [id, displayName, displayPrice, displayImage, toggleWishlist, wishlisted]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({ id, name: displayName, price: displayPrice, image: displayImage });
      setAddedToCart(true);
      toast.success('Added to cart', {
        description: displayName,
        duration: 2000,
      });
      setTimeout(() => setAddedToCart(false), 1500);
    },
    [id, displayName, displayPrice, displayImage, addItem]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onQuickView) {
        onQuickView();
      }
    },
    [onQuickView]
  );

  // Compute sale badge from prices if not provided
  const displayBadge = badge
    ? badge
    : displayOriginalPrice && displayOriginalPrice > displayPrice
      ? `-${Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}%`
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="bg-card rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-xl border border-border/40 transition-all duration-500 group flex flex-col h-full"
    >
      {/* Image Container with Link */}
      <div className="aspect-[3/4] overflow-hidden relative bg-muted/20">
        <Link href={`/product/${id}`} className="block w-full h-full relative" aria-label={displayName}>
          {/* Primary Image */}
          <Image
            src={displayImage}
            alt={displayName}
            fill
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Secondary Image on Hover (if available) */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${displayName} alternate view`}
              fill
              className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlist}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 w-9 h-9 md:w-10 md:h-10 rounded-full glass flex items-center justify-center cursor-pointer z-10 shadow-sm"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'w-4 h-4 md:w-[18px] md:h-[18px] transition-colors duration-300',
              wishlisted
                ? 'text-red-500 fill-red-500'
                : 'text-white'
            )}
          />
        </motion.button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {displayBadge && (
            <span className="gradient-gold text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
              {displayBadge}
            </span>
          )}
          {isNew && !displayBadge && (
            <span className="bg-foreground text-background text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={handleQuickView}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 text-white z-10 cursor-pointer flex items-center gap-1.5 hover:bg-white/30"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          {category && (
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium line-clamp-1">
              {category}
            </p>
          )}

          <Link href={`/product/${id}`} className="block group-hover:text-gold transition-colors duration-300">
            <h3 className="text-sm font-medium line-clamp-1 text-foreground">
              {displayName}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 pt-0.5">
            <StarRating rating={rating} />
            <span className="text-[11px] text-muted-foreground font-medium">
              ({reviewCount})
            </span>
          </div>
        </div>

        <div className="pt-1">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base md:text-lg font-semibold text-foreground">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {displayOriginalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{displayOriginalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'w-full py-2.5 rounded-2xl font-medium text-xs md:text-sm btn-ripple transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm',
              addedToCart
                ? 'bg-gold text-white shadow-gold/20'
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
                Add to Cart
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}