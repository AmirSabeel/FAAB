'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import {
  Home,
  Search,
  Heart,
  ShoppingBag,
  User,
  X,
  Sun,
  Moon,
  LayoutGrid,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useWishlistStore } from '@/components/wishlist-store'

/* ================================================================
   useMobileNav — Custom hook for mobile navigation drawer state
   ================================================================ */

export function useMobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle } as const
}

/* ================================================================
   Constants
   ================================================================ */

const DRAWER_LINKS = [
  { label: 'New In', href: '/shop?category=All' },
  { label: 'Women', href: "/shop?category=Women's Fashion" },
  { label: 'Men', href: "/shop?category=Men's Fashion" },
  { label: 'Collections', href: '/shop' },
  { label: 'Sale', href: '/shop?sale=true' },
  { label: 'Admin Panel', href: '#', icon: LayoutGrid, isAdmin: true },
] as const

const BOTTOM_NAV_ITEMS = [
  { icon: Home, label: 'Home', key: 'home' },
  { icon: Search, label: 'Search', key: 'search' },
  { icon: Heart, label: 'Wishlist', key: 'wishlist' },
  { icon: ShoppingBag, label: 'Cart', key: 'cart' },
  { icon: User, label: 'Profile', key: 'profile' },
] as const

/* ================================================================
   MobileNavDrawer — Slide-in hamburger menu (right side)
   ================================================================ */

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAdminClick?: () => void
}

export function MobileNavDrawer({ isOpen, onClose, onAdminClick }: MobileNavDrawerProps) {
  const { theme, setTheme } = useTheme()

  // Lock body scroll when drawer is open
  // (handled via AnimatePresence and the overlay click)

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
            aria-hidden
          />

          {/* Drawer Panel */}
          <motion.div
            key="mobile-nav-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[85vw] max-w-[360px] md:hidden flex flex-col"
          >
            {/* Drawer background with glass effect */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-border/50" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-16">
                <span className="tracking-[0.3em] font-semibold text-sm uppercase text-muted-foreground">
                  Menu
                </span>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-foreground/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 mb-6">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search FAAB..."
                    className={cn(
                      'w-full h-12 pl-11 pr-4 rounded-2xl',
                      'bg-muted/60 border border-border/50 text-sm',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/30',
                      'transition-all duration-200'
                    )}
                  />
                </div>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 px-4">
                <div className="flex flex-col gap-1">
                  {DRAWER_LINKS.map((link, i) => {
                    const isLast = i === DRAWER_LINKS.length - 1
                    const isAdminItem = 'isAdmin' in link && link.isAdmin

                    return (
                      <motion.button
                        key={link.label}
                        type="button"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.1 + i * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isAdminItem) {
                            onClose()
                            onAdminClick?.()
                          }
                        }}
                        className={cn(
                          'flex items-center gap-3 min-h-12 px-4 rounded-2xl w-full text-left',
                          isLast && 'mt-3 pt-3 border-t border-border/30',
                          isAdminItem
                            ? 'text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground'
                            : 'text-base font-medium tracking-wide text-foreground/80 hover:text-foreground',
                          'hover:bg-foreground/[0.04] active:bg-foreground/[0.06]',
                          'transition-colors duration-200'
                        )}
                      >
                        {isAdminItem && link.icon && (
                          <link.icon className="w-4 h-4" />
                        )}
                        {link.label}
                      </motion.button>
                    )
                  })}
                </div>
              </nav>

              {/* Footer: Theme Toggle */}
              <div className="px-4 pb-10 safe-bottom">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme}
                  className={cn(
                    'flex items-center gap-3 w-full min-h-12 px-4 rounded-2xl',
                    'text-sm font-medium tracking-wide text-muted-foreground',
                    'hover:text-foreground hover:bg-foreground/[0.04]',
                    'active:bg-foreground/[0.06] transition-colors duration-200'
                  )}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4.5 h-4.5" />
                  ) : (
                    <Moon className="w-4.5 h-4.5" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ================================================================
   BottomNavBar — Fixed bottom tab bar (mobile only)
   ================================================================ */

interface BottomNavBarProps {
  onSearchClick?: () => void
  onCartClick?: () => void
  onAuthClick?: () => void
  onProfileClick?: () => void
}

export function BottomNavBar({ onSearchClick, onCartClick, onAuthClick, onProfileClick }: BottomNavBarProps) {
  const [activeKey, setActiveKey] = useState<string>('home')
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const { data: session } = useSession()

  function handleTabClick(key: string) {
    setActiveKey(key)
    if (key === 'home') return
    if (key === 'search') { onSearchClick?.(); return }
    if (key === 'cart') { onCartClick?.(); return }
    if (key === 'profile') {
      if (session) onProfileClick?.()
      else onAuthClick?.()
      return
    }
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        'glass safe-bottom'
      )}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = activeKey === item.key
          const Icon = item.icon

          // Wishlist navigates to /wishlist page
          if (item.key === 'wishlist') {
            return (
              <Link
                key={item.key}
                href="/wishlist"
                aria-label={item.label}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5',
                  'w-16 h-12 rounded-xl',
                  'transition-colors duration-200',
                )}
              >
                <span className="flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <span className="text-[10px] leading-none font-medium tracking-wide text-muted-foreground">
                  {item.label}
                </span>
                {/* Wishlist count badge */}
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-1 w-4 h-4 min-w-[16px] rounded-full gradient-gold text-white text-[8px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )
          }

          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              onClick={() => handleTabClick(item.key)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                'w-16 h-12 rounded-xl',
                'transition-colors duration-200',
                isActive ? 'text-gold' : 'text-muted-foreground'
              )}
            >
              <motion.span
                animate={{ scale: isActive ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center justify-center"
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
              </motion.span>

              <span
                className={cn(
                  'text-[10px] leading-none font-medium tracking-wide transition-colors duration-200',
                  isActive ? 'text-gold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-gold"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}