'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminProducts } from '@/components/admin/admin-products'
import { AdminOrders } from '@/components/admin/admin-orders'
import { AdminCustomers } from '@/components/admin/admin-customers'
import { AdminAnalytics } from '@/components/admin/admin-analytics'
import { useAdminStore } from '@/components/admin/admin-store'
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
import { ShoppingBag, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function Home() {
  const isAdmin = useAdminStore((s) => s.isAdmin)
  const setIsAdmin = useAdminStore((s) => s.setIsAdmin)
  const activeTab = useAdminStore((s) => s.activeTab)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<null | { id: string; name: string; price: number; originalPrice?: number; image: string; rating: number; reviewCount: number; description?: string }>(null)
  const mounted = useHydrated()
  const { isOpen, close, toggle } = useMobileNav()
  const cartCount = useCartStore((s) => s.totalItems())

  // Lock body scroll when any overlay is open
  useEffect(() => {
    if (searchOpen || isOpen || cartOpen || wishlistOpen || quickViewOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [searchOpen, isOpen, cartOpen, wishlistOpen, quickViewOpen])

  // Welcome toast
  useEffect(() => {
    const timer = setTimeout(() => {
      toast('Welcome to MAISON', { description: 'Discover our latest collections curated for you.', duration: 4000 })
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Reset scroll when toggling admin
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [isAdmin])

  // ─── Admin Panel ──────────────────────────────────────────────
  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <AdminLayout>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'products' && <AdminProducts />}
              {activeTab === 'orders' && <AdminOrders />}
              {activeTab === 'customers' && <AdminCustomers />}
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'settings' && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h2 className="text-xl font-semibold">Settings</h2>
                  <p className="text-muted-foreground mt-2">Store settings and configuration coming soon.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </AdminLayout>
      </QueryClientProvider>
    )
  }

  // ─── Store Frontend ────────────────────────────────────────────
  return (
    <QueryClientProvider client={queryClient}>
      <PageLoader />
      <Navbar onMenuClick={toggle} onSearchClick={() => setSearchOpen(true)} onWishlistClick={() => setWishlistOpen(true)} onCartClick={() => setCartOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNavDrawer isOpen={isOpen} onClose={close} onAdminClick={() => setIsAdmin(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <QuickViewModal isOpen={quickViewOpen} onClose={() => { setQuickViewOpen(false); setQuickViewProduct(null) }} product={quickViewProduct} />

      {/* Floating Cart Toggle */}
      {mounted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => setCartOpen(true)}
          aria-label="Open shopping bag"
          className="fixed bottom-40 right-4 md:bottom-8 md:right-24 z-50 w-12 h-12 rounded-full bg-foreground text-background shadow-luxury-lg flex items-center justify-center dark:bg-background dark:text-foreground dark:border dark:border-border"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2} />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-gold text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      <main className="min-h-screen">
        <HeroSlider />
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><CategoriesSection /></section>
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><FeaturedCollections /></section>
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><TrendingProducts /></section>
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><NewArrivals /></section>
        <PromoBanner />
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><CustomerReviews /></section>
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><FeaturesSection /></section>
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><AnimatedStats /></section>
        <NewsletterSection />
        <section className="py-16 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"><FAQSection /></section>
      </main>
      <Footer />
      <BottomNavBar />
      <BackToTop />
      <WhatsAppButton />
    </QueryClientProvider>
  )
}