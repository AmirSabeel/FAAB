'use client'

import { useCartDbSync } from '@/components/cart-drawer'
import { useWishlistDbSync } from '@/components/wishlist-store'

/**
 * Activates cart + wishlist DB sync for logged-in users.
 * Must be rendered inside SessionProvider.
 */
export function DbSyncProvider({ children }: { children: React.ReactNode }) {
  useCartDbSync()
  useWishlistDbSync()
  return <>{children}</>
}