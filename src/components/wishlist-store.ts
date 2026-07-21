'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  addedAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (id: string) => void;
  setItems: (items: WishlistItem[]) => void;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  isInWishlist: (id: string) => boolean;
  itemCount: () => number;
  _hydrated: boolean;
  _setHydrated: () => void;
  _syncToDb: () => Promise<void>;
  _loadFromDb: () => Promise<void>;
}

// ─── DB Sync helpers ──────────────────────────────────────────────────────────

async function syncWishlistToDb(items: WishlistItem[]) {
  try {
    await fetch('/api/wishlist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {
    // Silent
  }
}

async function loadWishlistFromDb(): Promise<WishlistItem[]> {
  try {
    const res = await fetch('/api/wishlist');
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      _setHydrated: () => set({ _hydrated: true }),

      addItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.id === item.id);
        if (!exists) {
          set({
            items: [...items, { ...item, addedAt: Date.now() }],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      setItems: (newItems) => {
        set({ items: newItems });
      },

      toggleItem: (item) => {
        const { items } = get();
        const exists = items.some((i) => i.id === item.id);
        if (exists) {
          set({ items: items.filter((i) => i.id !== item.id) });
        } else {
          set({
            items: [...items, { ...item, addedAt: Date.now() }],
          });
        }
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },

      itemCount: () => {
        return get().items.length;
      },

      _syncToDb: async () => {
        const { items } = get();
        await syncWishlistToDb(items);
      },

      _loadFromDb: async () => {
        const dbItems = await loadWishlistFromDb();
        if (dbItems.length > 0) {
          const localItems = get().items;
          const dbIds = new Set(dbItems.map((i) => i.id));
          const localOnly = localItems.filter((i) => !dbIds.has(i.id));
          set({ items: [...dbItems, ...localOnly] });
        }
      },
    }),
    {
      name: 'faab-wishlist',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    }
  )
);

// ─── DB Sync Hook ─────────────────────────────────────────────────────────────

export function useWishlistDbSync() {
  const { data: session, status } = useSession();
  const items = useWishlistStore((s) => s.items);
  const _hydrated = useWishlistStore((s) => s._hydrated);
  const _loadFromDb = useWishlistStore((s) => s._loadFromDb);
  const _syncToDb = useWishlistStore((s) => s._syncToDb);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from DB when user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && _hydrated) {
      _loadFromDb();
    }
  }, [status, session?.user?.id, _hydrated, _loadFromDb]);

  // Sync to DB on changes (debounced)
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