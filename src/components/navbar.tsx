'use client'

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon, Search, Heart, ShoppingBag, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = ['New In', 'Women', 'Men', 'Collections', 'Sale'] as const

interface NavbarProps {
  onMenuClick?: () => void
}

const emptySubscribe = () => () => {}

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const mounted = useHydrated()
  const { theme, setTheme } = useTheme()

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        scrolled ? 'glass shadow-luxury' : 'bg-transparent'
      )}
    >
      <nav
        className={cn(
          'mx-auto flex items-center justify-between px-4 md:px-8 lg:px-12',
          'h-16 md:h-20'
        )}
      >
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger - Mobile only */}
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-10 h-10 rounded-xl md:hidden hover:bg-foreground/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="/"
              className="tracking-[0.3em] font-semibold text-lg uppercase select-none"
            >
              MAISON
            </a>
          </motion.div>
        </div>

        {/* Center: Nav Links - Desktop only */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link, i) => (
            <NavLink key={link} label={link} index={i} />
          ))}
        </div>

        {/* Right: Action Icons */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-0.5 sm:gap-1"
        >
          {/* Theme Toggle */}
          <AnimatePresence mode="wait">
            {mounted && (
              <motion.button
                key={theme}
                initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-foreground/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Search */}
          <ActionButton icon={<Search className="w-[18px] h-[18px]" />} label="Search" />

          {/* Wishlist */}
          <ActionButton icon={<Heart className="w-[18px] h-[18px]" />} label="Wishlist" />

          {/* Cart with Badge */}
          <div className="relative">
            <ActionButton icon={<ShoppingBag className="w-[18px] h-[18px]" />} label="Cart" />
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 min-w-[18px] rounded-full gradient-gold text-[10px] font-semibold text-white leading-none">
              3
            </span>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}

/* ========== Desktop Nav Link with Gold Underline ========== */

function NavLink({ label, index }: { label: string; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.15 + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative px-4 py-2 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300"
    >
      {label}
      <motion.span
        className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-gold origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.a>
  )
}

/* ========== Reusable Action Icon Button ========== */

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-foreground/5 transition-colors duration-200"
      aria-label={label}
    >
      {icon}
    </button>
  )
}