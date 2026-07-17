'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/components/wishlist-store';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ========== Animation Variants ========== */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    x: 24,
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
};

const emptyVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

/* ========== Component ========== */

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);

  // Lock body scroll when drawer is open
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

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  const handleMoveToBag = useCallback((item: typeof items[number]) => {
    // Placeholder: in production, this would add to cart store
    // For now we just log it
    console.log('Move to bag:', item.name);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-[91] w-full max-w-md bg-background shadow-luxury-xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
          >
            {/* ===== Header ===== */}
            <div className="p-6 pb-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  Wishlist
                </h2>
                {items.length > 0 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full gradient-gold text-[11px] font-semibold text-white"
                  >
                    {items.length}
                  </motion.span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close wishlist"
                className={cn(
                  'w-10 h-10 rounded-2xl',
                  'flex items-center justify-center',
                  'hover:bg-muted transition-colors duration-200',
                  'text-muted-foreground hover:text-foreground',
                  'cursor-pointer'
                )}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* ===== Items List (scrollable) ===== */}
            <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    variants={emptyVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center justify-center text-center py-20 px-4"
                  >
                    <Heart
                      className="w-16 h-16 text-muted-foreground/30 mb-6"
                      strokeWidth={1.5}
                    />
                    <p className="text-base font-medium text-foreground mb-2">
                      Your wishlist is empty
                    </p>
                    <p className="text-sm text-muted-foreground mb-8 max-w-[240px]">
                      Save items you love for later
                    </p>
                    <button
                      onClick={onClose}
                      className={cn(
                        'inline-flex items-center gap-2',
                        'text-sm font-medium text-gold',
                        'hover:underline underline-offset-4',
                        'transition-colors duration-200',
                        'cursor-pointer'
                      )}
                    >
                      Explore Collections
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-border/50"
                  >
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          layout
                          exit="exit"
                          className="flex gap-4 py-4"
                        >
                          {/* Item Image */}
                          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 relative">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          {/* Item Info */}
                          <div className="flex-1 min-w-0 relative">
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemove(item.id)}
                              aria-label={`Remove ${item.name} from wishlist`}
                              className={cn(
                                'absolute top-0 right-0',
                                'w-7 h-7 rounded-full',
                                'flex items-center justify-center',
                                'hover:bg-muted transition-colors duration-200',
                                'text-muted-foreground/50 hover:text-foreground',
                                'cursor-pointer'
                              )}
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>

                            <p className="text-sm font-medium line-clamp-1 pr-6 text-foreground">
                              {item.name}
                            </p>

                            <p className="text-sm font-semibold mt-1 text-foreground">
                              ₹{item.price.toLocaleString('en-IN')}
                            </p>

                            <button
                              onClick={() => handleMoveToBag(item)}
                              className={cn(
                                'text-xs text-gold font-medium mt-2',
                                'hover:underline underline-offset-2',
                                'transition-colors duration-200',
                                'cursor-pointer'
                              )}
                            >
                              Move to Bag
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ===== Footer (sticky) ===== */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="border-t border-border p-6 safe-bottom shrink-0"
              >
                <button
                  onClick={onClose}
                  className={cn(
                    'w-full flex items-center justify-center gap-2',
                    'py-3 rounded-2xl',
                    'text-sm font-medium',
                    'bg-foreground text-background',
                    'hover:bg-gold hover:text-white',
                    'transition-colors duration-300',
                    'btn-ripple',
                    'cursor-pointer'
                  )}
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}