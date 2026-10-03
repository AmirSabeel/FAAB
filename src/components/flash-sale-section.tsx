'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ShoppingBag, Check, Star, ArrowRight, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/components/cart-drawer';

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
  sizes: string[];
  colors: { name: string; hex: string }[];
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
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1067&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 148,
    claimedPct: 82,
    stockLeft: 3,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Midnight Navy', hex: '#1e293b' },
      { name: 'Champagne Gold', hex: '#d4af37' },
    ],
    description: 'Impeccably tailored silk blend single-breasted blazer with structured shoulders, satin peak lapels, and custom engraved gold buttons.',
  },
  {
    id: 'trend-4',
    name: 'Minimal Sapphire Chronograph Watch',
    category: 'Watches',
    price: 15999,
    originalPrice: 28967,
    discountPct: 45,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1067&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.8,
    reviewCount: 203,
    claimedPct: 76,
    stockLeft: 5,
    sizes: ['One Size (40mm)'],
    colors: [
      { name: 'Brushed Gold', hex: '#c5a059' },
      { name: 'Matte Black', hex: '#18181b' },
      { name: 'Silver Mesh', hex: '#cbd5e1' },
    ],
    description: 'Ultra-slim Swiss quartz timepiece featuring scratch-resistant sapphire crystal glass and an interchangeable Milanese mesh strap.',
  },
  {
    id: 'trend-2',
    name: 'Grade-A Mongolian Cashmere Sweater',
    category: "Women's Fashion",
    price: 18999,
    originalPrice: 34999,
    discountPct: 46,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1067&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.9,
    reviewCount: 92,
    claimedPct: 91,
    stockLeft: 2,
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Warm Ivory', hex: '#fdfbf7' },
      { name: 'Camel Tan', hex: '#c19a6b' },
      { name: 'Heather Gray', hex: '#94a3b8' },
    ],
    description: 'Pure 2-ply Mongolian cashmere woven for cloud-like softness, thermo-regulating warmth, and an effortless relaxed drape.',
  },
  {
    id: 'trend-3',
    name: 'Handcrafted Italian Leather Tote',
    category: 'Accessories',
    price: 29999,
    originalPrice: 49717,
    discountPct: 40,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1067&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1067&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1067&fit=crop&q=80',
    ],
    rating: 4.7,
    reviewCount: 156,
    claimedPct: 68,
    stockLeft: 6,
    sizes: ['Medium', 'Large'],
    colors: [
      { name: 'Cognac Brown', hex: '#8b4513' },
      { name: 'Pitch Black', hex: '#0a0a0a' },
      { name: 'Forest Olive', hex: '#3d4a3e' },
    ],
    description: 'Full-grain Tuscan calfskin tote with suede-lined interior, laptop compartment, and gold-plated hardware closures.',
  },
];

interface FlashSaleSectionProps {
  onQuickView?: (product: any) => void;
}

export function FlashSaleSection({ onQuickView }: FlashSaleSectionProps) {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Countdown Timer State ──
  const [timeLeft, setTimeLeft] = useState({
    hours: '07',
    minutes: '48',
    seconds: '24',
  });

  useEffect(() => {
    // Target 8 hours from initial load or persistent timestamp
    const getTargetTime = () => {
      const stored = localStorage.getItem('faab_flash_sale_end');
      if (stored) {
        const target = parseInt(stored, 10);
        if (target > Date.now()) return target;
      }
      const newTarget = Date.now() + 8 * 60 * 60 * 1000 + 48 * 60 * 1000 + 24 * 1000;
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

  const activeProduct = FLASH_PRODUCTS[selectedProductIndex];

  // Sync initial size & color when active product changes
  useEffect(() => {
    if (activeProduct.sizes.length > 0) {
      setSelectedSize(activeProduct.sizes[0]);
    }
    if (activeProduct.colors.length > 0) {
      setSelectedColor(activeProduct.colors[0].name);
    }
  }, [selectedProductIndex, activeProduct]);

  // Add to cart handler
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = useCallback(() => {
    addItem({
      id: activeProduct.id,
      name: activeProduct.name,
      price: activeProduct.price,
      image: activeProduct.image,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    setAddedToCart(true);
    toast.success('Flash deal added to your bag!', {
      description: `${activeProduct.name} ${selectedSize ? `• Size: ${selectedSize}` : ''}`,
      duration: 3000,
    });
    setTimeout(() => setAddedToCart(false), 2000);
  }, [addItem, activeProduct, selectedSize, selectedColor]);

  const savingsAmount = activeProduct.originalPrice - activeProduct.price;

  return (
    <section className="py-12 md:py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Outer Shell with Luxury Obsidian / Dark Gradient Background */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6 sm:p-8 md:p-12 lg:p-16 border border-gold/30 shadow-2xl shadow-black/80">
        {/* Glow ambient lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        {/* Diagonal luxury background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none -z-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #c5a059, #c5a059 1px, transparent 1px, transparent 30px)`,
          }}
        />

        {/* ── Top Header: Badge & Live Countdown Ticker ── */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold tracking-wider uppercase">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
              <span>Deal of the Day • Limited Flash Offer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>Flash Sale Specials</span>
              <span className="text-base sm:text-lg font-normal text-gold hidden sm:inline">
                Up to 50% Off
              </span>
            </h2>
          </div>

          {/* Countdown Clock Tiles */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-medium mr-1 hidden sm:flex">
              <Clock className="w-4 h-4 text-gold animate-spin-slow" />
              <span>Ends In:</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/5 border border-gold/40 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-wider">
                    {timeLeft.hours}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase mt-1">
                  Hours
                </span>
              </div>

              <span className="text-xl font-bold text-gold/60 -mt-4">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/5 border border-gold/40 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-wider">
                    {timeLeft.minutes}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase mt-1">
                  Mins
                </span>
              </div>

              <span className="text-xl font-bold text-gold/60 -mt-4">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-white/5 border border-gold/40 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <span className="text-xl sm:text-2xl font-bold text-amber-400 tabular-nums tracking-wider">
                    {timeLeft.seconds}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase mt-1">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Body: Featured Spotlight & Deal Switcher ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-center">
          {/* Left Column: Interactive Product Image & Angle Previews (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-2xl">
              <Image
                src={activeProduct.image}
                alt={activeProduct.name}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />

              {/* Discount Percentage Badge */}
              <div className="absolute top-4 left-4 gradient-gold text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>-{activeProduct.discountPct}% OFF</span>
              </div>

              {/* Quick View Button */}
              {onQuickView && (
                <button
                  onClick={() => onQuickView(activeProduct)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-5 py-2.5 rounded-full text-xs font-medium text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-white/30 cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Quick View</span>
                </button>
              )}
            </div>

            {/* Product Switcher Pills below photo */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {FLASH_PRODUCTS.map((prod, idx) => {
                const isSelected = idx === selectedProductIndex;
                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProductIndex(idx)}
                    className={cn(
                      'relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group/thumb',
                      isSelected
                        ? 'border-gold ring-2 ring-gold/40 scale-102'
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    )}
                  >
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <span className="absolute top-1 right-1 gradient-gold text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full">
                      -{prod.discountPct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Details, Urgency Bar, Variant Pickers & Quick Buy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                  {activeProduct.category}
                </span>
                <span className="text-zinc-600">•</span>
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{activeProduct.rating}</span>
                  <span className="text-zinc-400">({activeProduct.reviewCount} reviews)</span>
                </div>
              </div>

              <Link href={`/product/${activeProduct.id}`}>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight hover:text-gold transition-colors duration-300">
                  {activeProduct.name}
                </h3>
              </Link>

              <p className="text-zinc-300 text-sm md:text-base line-clamp-2 pt-1 font-light leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Price block & Savings */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    ₹{activeProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base sm:text-lg text-zinc-400 line-through">
                    ₹{activeProduct.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <span>Instant Savings: ₹{savingsAmount.toLocaleString('en-IN')}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-[10px] font-bold">
                    SAVE {activeProduct.discountPct}%
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Offer Validity</span>
                <span className="text-xs font-semibold text-gold">Today Only • Online Exclusive</span>
              </div>
            </div>

            {/* ── Urgency Stock Progress Bar ── */}
            <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
                  <span>
                    <strong>{activeProduct.claimedPct}% Claimed</strong> — Only {activeProduct.stockLeft} units left in stock!
                  </span>
                </span>
                <span className="text-zinc-400 tabular-nums">Selling Fast</span>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProduct.claimedPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-gold to-yellow-300 shadow-sm"
                />
              </div>
            </div>

            {/* ── Interactive Selectors (Sizes & Colors) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sizes */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Select Size: <span className="text-white font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeProduct.sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={cn(
                          'h-9 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                          isSelected
                            ? 'gradient-gold text-white shadow-md shadow-gold/20 scale-105'
                            : 'bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white border border-white/10'
                        )}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Color: <span className="text-white font-bold">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {activeProduct.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        className={cn(
                          'w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center relative',
                          isSelected
                            ? 'ring-2 ring-gold ring-offset-2 ring-offset-zinc-950 scale-110'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'w-full sm:flex-1 py-4 px-8 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl',
                  addedToCart
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'gradient-gold text-white hover:opacity-95 shadow-gold/30 hover:shadow-gold/50'
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Claim Deal & Add to Bag</span>
                  </>
                )}
              </motion.button>

              <Link
                href={`/product/${activeProduct.id}`}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-white/20 text-white font-medium text-sm hover:bg-white/10 hover:border-gold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Full Item</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>100% Authentic Guarantee</span>
              </div>
              <span>•</span>
              <div>Free Express Shipping & 30-Day Returns</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
