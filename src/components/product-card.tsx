'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
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
  rating,
  reviewCount,
  badge,
  isNew,
  onQuickView,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  }, []);

  const handleAddToCart = useCallback(() => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="bg-card rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-xl transition-all duration-500 group"
    >
      {/* Image Container */}
      <div className="aspect-[3/4] overflow-hidden relative">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlist}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer z-10"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'w-[18px] h-[18px] transition-colors duration-300',
              isWishlisted
                ? 'text-red-500 fill-red-500'
                : 'text-white'
            )}
          />
        </motion.button>

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 gradient-gold text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
            {badge}
          </span>
        )}
        {isNew && !badge && (
          <span className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
            NEW
          </span>
        )}

        {/* Quick View Button */}
        <button
          onClick={onQuickView}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-white z-10 cursor-pointer"
        >
          Quick View
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium line-clamp-1 text-foreground">
          {name}
        </h3>

        <div className="flex items-center gap-1.5">
          <StarRating rating={rating} />
          <span className="text-xs text-muted-foreground">
            ({reviewCount})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-full mt-2 py-2.5 rounded-2xl font-medium text-sm btn-ripple transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer',
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
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}