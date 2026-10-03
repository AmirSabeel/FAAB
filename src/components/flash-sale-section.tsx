'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Clock, ShoppingBag, Check, Star, Heart, Flame, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/components/cart-drawer';
import { useWishlistStore } from '@/components/wishlist-store';

interface FlashProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPct: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  claimedPct: number;
  stockLeft: number;
  description: string;
}

const FLASH_PRODUCTS: FlashProduct[] = [
  {
    id: 'trend-1',
    name: 'Silk Blend Tailored Blazer',
    category: "Women's Fashion",
    price: 31999,
    originalPrice: 58017,
    discountPct: 45,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=800&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 148,
    claimedPct: 82,
    stockLeft: 3,
    description: 'Impeccably tailored silk blend single-breasted blazer with structured shoulders and satin peak lapels.',
  },
  {
    id: 'trend-4',
    name: 'Sapphire Chronograph Watch',
    category: 'Watches',
    price: 15999,
    originalPrice: 28967,
    discountPct: 45,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=800&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 203,
    claimedPct: 76,
    stockLeft: 5,
    description: 'Ultra-slim Swiss quartz timepiece featuring scratch-resistant sapphire crystal glass.',
  },
  {
    id: 'trend-2',
    name: 'Mongolian Cashmere Sweater',
    category: "Women's Fashion",
    price: 18999,
    originalPrice: 34999,
    discountPct: 46,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=800&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 92,
    claimedPct: 91,
    stockLeft: 2,
    description: 'Pure 2-ply Mongolian cashmere woven for cloud-like softness and effortless drape.',
  },
  {
    id: 'trend-3',
    name: 'Tuscan Leather Tote Bag',
    category: 'Accessories',
    price: 29999,
    originalPrice: 49717,
    discountPct: 40,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop&q=80',
    ],
    rating: 4.7,
    reviewCount: 156,
    claimedPct: 68,
    stockLeft: 6,
    description: 'Full-grain Tuscan calfskin tote with suede-lined interior and gold-plated hardware.',
  },
];

interface FlashSaleSectionProps {
  onQuickView?: (product: any) => void;
}

export function FlashSaleSection({ onQuickView }: FlashSaleSectionProps) {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // ── Countdown Timer State ──
  const [timeLeft, setTimeLeft] = useState({
    hours: '07',
    minutes: '48',
    seconds: '24',
  });

  useEffect(() => {
    const getTargetTime = () => {
      const stored = localStorage.getItem('faab_flash_sale_end');
      if (stored) {
        const target = parseInt(stored, 10);
        if (target > Date.now()) return target;
      }
      const newTarget = Date.now() + 7 * 60 * 60 * 1000 + 48 * 60 * 1000 + 24 * 1000;
      localStorage.setItem('faab_flash_sale_end', newTarget.toString());
      return newTarget;
    };

    const targetTime = getTargetTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const handleAddToCart = useCallback((e: React.MouseEvent, product: FlashProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    toast.success('Added to bag!', {
      description: product.name,
      duration: 2000,
    });
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  }, [addItem]);

  const handleWishlist = useCallback((e: React.MouseEvent, product: FlashProduct) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  }, [toggleWishlist]);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* ── Section Header with Inline Live Countdown ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>Limited Time Offers</span>
            </div>
            <div className="relative inline-block">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                Flash Deals
              </h2>
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-12 rounded-full gradient-gold" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Exclusive daily markdown prices — available while stocks last
            </p>
          </div>

          {/* Compact Countdown Capsule */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border/80 shadow-sm shrink-0">
            <Clock className="w-4 h-4 text-gold shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-foreground">
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground tabular-nums">
                {timeLeft.hours}
              </span>
              <span className="text-gold font-bold">:</span>
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground tabular-nums">
                {timeLeft.minutes}
              </span>
              <span className="text-gold font-bold">:</span>
              <span className="px-1.5 py-0.5 rounded-md bg-gold/15 text-gold tabular-nums">
                {timeLeft.seconds}
              </span>
            </div>
          </div>
        </div>

        {/* ── 4-Column Sleek Luxury Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {FLASH_PRODUCTS.map((product) => {
            const isAdded = addedIds[product.id];
            const isWish = wishlisted(product.id);
            const secondaryImg = product.images && product.images.length > 1 ? product.images[1] : null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-card rounded-3xl overflow-hidden shadow-luxury hover:shadow-luxury-xl border border-border/40 transition-all duration-500 group flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="aspect-[3/4] overflow-hidden relative bg-muted/20">
                  <Link href={`/product/${product.id}`} className="block w-full h-full relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={cn(
                        "object-cover transition-all duration-700 ease-out",
                        secondaryImg ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
                      )}
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {secondaryImg && (
                      <Image
                        src={secondaryImg}
                        alt={`${product.name} alt`}
                        fill
                        className="object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    )}
                  </Link>

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 gradient-gold text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                    <Zap className="w-3 h-3 fill-white" />
                    <span>-{product.discountPct}%</span>
                  </div>

                  {/* Wishlist Button */}
                  <motion.button
                    onClick={(e) => handleWishlist(e, product)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center cursor-pointer z-10 shadow-sm"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isWish ? 'text-red-500 fill-red-500' : 'text-white'
                      )}
                    />
                  </motion.button>

                  {/* Quick View Button */}
                  {onQuickView && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-xs font-medium text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-white/30 cursor-pointer flex items-center gap-1.5 z-10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      {product.category}
                    </p>

                    <Link href={`/product/${product.id}`} className="block group-hover:text-gold transition-colors">
                      <h3 className="text-sm font-medium line-clamp-1 text-foreground">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              i < Math.round(product.rating)
                                ? 'text-gold fill-gold'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Prices */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base md:text-lg font-semibold text-foreground">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Stock Claimed Urgency Bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>{product.stockLeft} left in stock</span>
                        </span>
                        <span className="text-muted-foreground tabular-nums text-[10px]">
                          {product.claimedPct}% claimed
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-gold"
                          style={{ width: `${product.claimedPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Add to Bag Button */}
                    <motion.button
                      onClick={(e) => handleAddToCart(e, product)}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        'w-full mt-3 py-2.5 rounded-2xl font-medium text-xs md:text-sm btn-ripple transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm',
                        isAdded
                          ? 'bg-gold text-white shadow-gold/20'
                          : 'bg-foreground text-background hover:bg-gold hover:text-white'
                      )}
                    >
                      {isAdded ? (
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
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
