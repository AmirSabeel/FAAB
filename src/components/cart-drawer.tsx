'use client';

import { useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  _syncToDb: () => Promise<void>;
  _loadFromDb: () => Promise<void>;
  _hydrated: boolean;
  _setHydrated: () => void;
}

// ─── DB Sync helpers (defined outside store to avoid circular deps) ──────────

async function syncCartToDb(items: CartItem[]) {
  try {
    await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    // Silent — DB sync failure should not break local cart
  }
}

async function loadCartFromDb(): Promise<CartItem[]> {
  try {
    const res = await fetch('/api/cart');
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

// ─── Zustand Store (exported for external use) ───────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      _setHydrated: () => set({ _hydrated: true }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => {
        set({ items: [] });
        // Also clear from DB
        fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      _syncToDb: async () => {
        const { items } = get();
        await syncCartToDb(items);
      },

      _loadFromDb: async () => {
        const dbItems = await loadCartFromDb();
        if (dbItems.length > 0) {
          // Merge: DB items take priority, but don't lose local items not in DB
          const localItems = get().items;
          const dbIds = new Set(dbItems.map((i) => i.id));
          const localOnly = localItems.filter((i) => !dbIds.has(i.id));
          set({ items: [...dbItems, ...localOnly] });
        }
      },
    }),
    {
      name: 'faab-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    }
  )
);

// ─── DB Sync Hook ─────────────────────────────────────────────────────────────

export function useCartDbSync() {
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const _hydrated = useCartStore((s) => s._hydrated);
  const _loadFromDb = useCartStore((s) => s._loadFromDb);
  const _syncToDb = useCartStore((s) => s._syncToDb);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from DB when user logs in (only once per login)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && _hydrated) {
      _loadFromDb();
    }
  }, [status, session?.user?.id, _hydrated, _loadFromDb]);

  // Sync to DB on item changes (debounced)
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || !_hydrated) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      _syncToDb();
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [items, status, session?.user?.id, _hydrated, _syncToDb]);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20, height: 0, overflow: 'hidden' },
};

const itemContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// ─── Quantity Control ────────────────────────────────────────────────────────

interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

function QuantityControl({ quantity, onDecrease, onIncrease }: QuantityControlProps) {
  const quantityRef = useRef<HTMLSpanElement>(null);

  const animatePop = useCallback(() => {
    if (!quantityRef.current) return;
    const el = quantityRef.current;
    el.style.transform = 'scale(1.3)';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
    }, 150);
  }, []);

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={() => {
          onDecrease();
          animatePop();
        }}
        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-xs hover:bg-muted transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span
        ref={quantityRef}
        className="text-sm font-medium w-8 text-center tabular-nums transition-transform duration-150"
      >
        {quantity}
      </span>
      <button
        onClick={() => {
          onIncrease();
          animatePop();
        }}
        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-xs hover:bg-muted transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Cart Item Row ───────────────────────────────────────────────────────────

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex gap-4 py-4 border-b border-border/50"
    >
      {/* Product Image */}
      <div className="w-24 h-32 rounded-2xl overflow-hidden bg-muted flex-shrink-0 relative">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
          <button
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -mr-1 -mt-0.5 flex-shrink-0"
            aria-label={`Remove ${item.name}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Size / Color */}
        {(item.size || item.color) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.size && `Size: ${item.size}`}
            {item.size && item.color && ' · '}
            {item.color && `Color: ${item.color}`}
          </p>
        )}

        {/* Price */}
        <p className="text-sm font-semibold mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity */}
        <div className="mt-auto">
          <QuantityControl
            quantity={item.quantity}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyCartState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="flex flex-col items-center justify-center h-full px-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-5">
        <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1.5">
        Your bag is empty
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[240px]">
        Start shopping to add items to your bag
      </p>
      <button
        onClick={onClose}
        className="text-sm font-medium text-gold hover:text-gold-dark transition-colors underline underline-offset-4 decoration-gold/30 hover:decoration-gold-dark"
      >
        Browse Collections
      </button>
    </motion.div>
  );
}

// ─── Cart Drawer (Main Component) ────────────────────────────────────────────

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCartStore();

  // Lock body scroll when open
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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const count = totalItems();
  const subtotal = totalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Panel ── */}
          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[91] w-full max-w-md bg-background shadow-luxury-xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            {/* ── Header ── */}
            <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold">Shopping Bag</h2>
              <div className="flex items-center gap-3">
                {count > 0 && (
                  <span className="bg-gold/10 text-gold text-xs px-2.5 py-0.5 rounded-full font-medium tabular-nums">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Close bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Cart Items (scrollable) ── */}
            {items.length === 0 ? (
              <EmptyCartState onClose={onClose} />
            ) : (
              <motion.div
                variants={itemContainerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto px-6 no-scrollbar"
              >
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Footer ── */}
            {items.length > 0 && (
              <motion.footer
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="border-t border-border p-6 safe-bottom flex-shrink-0"
              >
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Shipping note */}
                <p className="text-xs text-muted-foreground mb-4">
                  Shipping &amp; taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onClose(); router.push('/checkout'); }}
                  className={cn(
                    'w-full py-3.5 rounded-2xl gradient-gold',
                    'text-white font-medium text-sm btn-ripple',
                    'hover:shadow-luxury-lg transition-all',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  <Lock className="w-4 h-4" strokeWidth={2} />
                  Proceed to Checkout
                </motion.button>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full text-sm text-muted-foreground hover:text-foreground mt-3 text-center transition-colors"
                >
                  Continue Shopping
                </button>
              </motion.footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}