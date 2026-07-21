'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
}

const popularSearches = [
  'Summer Collection',
  'Cashmere',
  'Leather Bags',
  'New Arrivals',
  'Sale',
];

const trendingCategories = [
  'Handbags',
  'Shoes',
  'Jewelry',
  'Ready-to-Wear',
  'Fragrances',
  'Watches',
  'Scarves',
  'Sunglasses',
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [recommended, setRecommended] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch recommended products on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/products?limit=4&sort=newest')
        .then((r) => r.json())
        .then((data) => setRecommended(data.products || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Live search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          search: trimmed,
          limit: '8',
          sort: 'newest',
        });
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleSearchClick = useCallback((term: string) => {
    setQuery(term);
    if (inputRef.current) {
      inputRef.current.value = term;
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className={cn(
            'fixed inset-0 z-[100]',
            'bg-background/80',
            'backdrop-blur-xl'
          )}
        >
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl mx-auto mt-24 px-4"
          >
            <div className="glass-card rounded-3xl p-6">
              {/* Search input row */}
              <div className="flex items-center gap-3">
                {searching ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground shrink-0 animate-spin" />
                ) : (
                  <Search
                    className="w-5 h-5 text-muted-foreground shrink-0"
                    strokeWidth={2}
                  />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Search for products, categories..."
                  className={cn(
                    'text-xl md:text-2xl font-light',
                    'bg-transparent border-none outline-none',
                    'w-full',
                    'placeholder:text-muted-foreground'
                  )}
                  aria-label="Search"
                />
                <button
                  onClick={handleClose}
                  aria-label="Close search"
                  className={cn(
                    'shrink-0',
                    'w-10 h-10 rounded-full',
                    'flex items-center justify-center',
                    'hover:bg-muted transition-colors duration-200',
                    'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50 my-5" />

              {/* Search results or default content */}
              {query.trim() ? (
                /* Search results */
                <div className="max-h-[50vh] overflow-y-auto">
                  {searching ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        Searching...
                      </p>
                    </div>
                  ) : results.length > 0 ? (
                    results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className={cn(
                          'w-full flex items-center gap-4',
                          'py-3 border-b border-border/30 last:border-0',
                          'hover:bg-muted/50 rounded-xl px-2 -mx-2',
                          'transition-colors duration-200',
                          'cursor-pointer text-left'
                        )}
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-foreground">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground text-sm">
                        No results found for &ldquo;{query}&rdquo;
                      </p>
                      <button
                        onClick={() => setQuery('')}
                        className="mt-3 text-sm text-gold hover:underline cursor-pointer"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Default content when query is empty */
                <>
                  {/* Recommended products */}
                  {recommended.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                        Recommended
                      </p>
                      <div className="max-h-[50vh] overflow-y-auto">
                        {recommended.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            onClick={onClose}
                            className={cn(
                              'w-full flex items-center gap-4',
                              'py-3 border-b border-border/30 last:border-0',
                              'hover:bg-muted/50 rounded-xl px-2 -mx-2',
                              'transition-colors duration-200',
                              'cursor-pointer text-left'
                            )}
                          >
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.category}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-semibold text-foreground">
                                  ₹{product.price.toLocaleString('en-IN')}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ₹{product.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div className="mb-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearchClick(term)}
                          className={cn(
                            'px-4 py-2 rounded-full',
                            'border border-border',
                            'text-sm',
                            'hover:bg-muted transition-colors duration-200',
                            'cursor-pointer',
                            'text-foreground'
                          )}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending Categories */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                      Trending Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingCategories.map((category) => (
                        <Link
                          key={category}
                          href={`/shop?search=${encodeURIComponent(category)}`}
                          onClick={onClose}
                          className={cn(
                            'px-3 py-1.5 rounded-full',
                            'bg-muted/60',
                            'text-xs font-medium',
                            'hover:bg-muted transition-colors duration-200',
                            'cursor-pointer',
                            'text-foreground'
                          )}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}