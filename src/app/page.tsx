'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Navbar } from '@/components/navbar'
import { useMobileNav, MobileNavDrawer, BottomNavBar } from '@/components/mobile-nav'
import HeroSlider from '@/components/hero-slider'
import { CategoriesSection, FeaturedCollections, TrendingProducts, NewArrivals } from '@/components/sections'
import { PromoBanner, CustomerReviews, FeaturesSection, AnimatedStats, NewsletterSection, FAQSection, Footer } from '@/components/sections-bottom'
import { BackToTop, WhatsAppButton } from '@/components/floating-buttons'
import { SearchModal } from '@/components/search-modal'
import { PageLoader } from '@/components/page-loader'
import { CartDrawer, useCartStore } from '@/components/cart-drawer'
import QuickViewModal from '@/components/quick-view-modal'
import { WishlistDrawer } from '@/components/wishlist-drawer'
import { useWishlistStore } from '@/components/wishlist-store'
import { ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function Home() {
  const { isOpen, open, close, toggle } = useMobileNav()
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<null | { id: string; name: string; price: number; originalPrice?: number; image: string; rating: number; reviewCount: number; description?: string }>(null)
  const mounted = useHydrated()
  const cartCount = useCartStore((s) => s.totalItems())
  const wishlistCount = useWishlistStore((s) => s.itemCount())

  // Lock body scroll when any overlay is open
  useEffect(() => {
    if (searchOpen || isOpen || cartOpen || wishlistOpen || quickViewOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [searchOpen, isOpen, cartOpen, wishlistOpen, quickViewOpen])

  // Show a welcome toast after loader finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      toast('Welcome to MAISON', {
        description: 'Discover our latest collections curated for you.',
        duration: 4000,
      })
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Page Loader Animation */}
      <PageLoader />

      {/* Sticky Navigation */}
      <Navbar
        onMenuClick={toggle}
        onSearchClick={() => setSearchOpen(true)}
        onWishlistClick={() => setWishlistOpen(true)}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer isOpen={isOpen} onClose={close} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Wishlist Drawer */}
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={quickViewOpen}
        onClose={() => { setQuickViewOpen(false); setQuickViewProduct(null) }}
        product={quickViewProduct}
      />

      {/* Floating Cart Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCartOpen(true)}
        aria-label="Open shopping bag"
        className="fixed bottom-40 right-4 md:bottom-8 md:right-24 z-50 w-12 h-12 rounded-full bg-foreground text-background shadow-luxury-lg flex items-center justify-center transition-shadow duration-300 dark:bg-background dark:text-foreground dark:border dark:border-border"
      >
        <ShoppingBag className="w-5 h-5" strokeWidth={2} />
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-gold text-white text-[10px] font-bold flex items-center justify-center"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main Content */}
      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSlider />

        {/* Categories */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <CategoriesSection />
        </section>

        {/* Featured Collections */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <FeaturedCollections />
        </section>

        {/* Trending Products */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <TrendingProducts />
        </section>

        {/* New Arrivals */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <NewArrivals />
        </section>

        {/* Promotional Banner */}
        <PromoBanner />

        {/* Customer Reviews */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <CustomerReviews />
        </section>

        {/* Features */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <FeaturesSection />
        </section>

        {/* Animated Stats */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <AnimatedStats />
        </section>

        {/* Newsletter */}
        <NewsletterSection />

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <FAQSection />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNavBar />

      {/* Floating Action Buttons */}
      <BackToTop />
      <WhatsAppButton />
    </>
  )
}