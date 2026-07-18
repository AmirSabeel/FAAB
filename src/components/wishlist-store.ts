'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  isInWishlist: (id: string) => boolean;
  itemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

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
    }),
    {
      name: 'faab-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);