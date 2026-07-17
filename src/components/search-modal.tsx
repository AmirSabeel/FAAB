'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Slight delay so animation starts first
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
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

  const handleSearchClick = useCallback(
    (query: string) => {
      if (inputRef.current) {
        inputRef.current.value = query;
        inputRef.current.focus();
      }
    },
    []
  );

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
            className={cn(
              'w-full max-w-2xl mx-auto mt-24 px-4'
            )}
          >
            <div className="glass-card rounded-3xl p-6">
              {/* Search input row */}
              <div className="flex items-center gap-3">
                <Search
                  className="w-5 h-5 text-muted-foreground shrink-0"
                  strokeWidth={2}
                />
                <input
                  ref={inputRef}
                  type="text"
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
                  onClick={onClose}
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
                    <button
                      key={category}
                      onClick={() => handleSearchClick(category)}
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
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}