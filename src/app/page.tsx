'use client'

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminHomepage } from '@/components/admin/admin-homepage'
import { AdminProducts } from '@/components/admin/admin-products'
import { AdminOrders } from '@/components/admin/admin-orders'
import { AdminCustomers } from '@/components/admin/admin-customers'
import { AdminAnalytics } from '@/components/admin/admin-analytics'
import { AdminSettings } from '@/components/admin/admin-settings'
import { AdminTrending } from '@/components/admin/admin-trending'
import { AdminNewArrivals } from '@/components/admin/admin-new-arrivals'
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
import { AuthModal } from '@/components/auth-modal'
import { ProfileDrawer } from '@/components/profile-drawer'
import { ShoppingBag, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const ADMIN_PASSWORD = '4444'

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
  const passwordPromptOpen = useAdminStore((s) => s.passwordPromptOpen)
  const setPasswordPromptOpen = useAdminStore((s) => s.setPasswordPromptOpen)

  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<null | { id: string; name: string; price: number; originalPrice?: number; image: string; rating: number; reviewCount: number; description?: string }>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordError, setAdminPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const mounted = useHydrated()
  const { isOpen, close, toggle } = useMobileNav()
  const cartCount = useCartStore((s) => s.totalItems())

  const handleAdminClick = useCallback(() => {
    setAdminPassword('')
    setAdminPasswordError('')
    setPasswordPromptOpen(true)
  }, [setPasswordPromptOpen])

  const handleAdminPasswordSubmit = useCallback(() => {
    if (adminPassword === ADMIN_PASSWORD) {
      setPasswordPromptOpen(false)
      setIsAdmin(true)
      setAdminPassword('')
      setAdminPasswordError('')
    } else {
      setAdminPasswordError('Incorrect password. Please try again.')
    }
  }, [adminPassword, setIsAdmin, setPasswordPromptOpen])

  // Lock body scroll when any overlay is open
  useEffect(() => {
    if (searchOpen || isOpen || cartOpen || wishlistOpen || quickViewOpen || authOpen || profileOpen || passwordPromptOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [searchOpen, isOpen, cartOpen, wishlistOpen, quickViewOpen, authOpen, profileOpen, passwordPromptOpen])

  // Welcome toast
  useEffect(() => {
    const timer = setTimeout(() => {
      toast('Welcome to FAAB', { description: 'Discover our latest collections curated for you.', duration: 4000 })
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
              {activeTab === 'homepage' && <AdminHomepage />}
              {activeTab === 'products' && <AdminProducts />}
              {activeTab === 'trending' && <AdminTrending />}
              {activeTab === 'new-arrivals' && <AdminNewArrivals />}
              {activeTab === 'orders' && <AdminOrders />}
              {activeTab === 'customers' && <AdminCustomers />}
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'settings' && <AdminSettings />}
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
      <Navbar onMenuClick={toggle} onSearchClick={() => setSearchOpen(true)} onWishlistClick={() => setWishlistOpen(true)} onCartClick={() => setCartOpen(true)} onAuthClick={() => setAuthOpen(true)} onProfileClick={() => setProfileOpen(true)} onAdminClick={handleAdminClick} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNavDrawer isOpen={isOpen} onClose={close} onAdminClick={handleAdminClick} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <QuickViewModal isOpen={quickViewOpen} onClose={() => { setQuickViewOpen(false); setQuickViewProduct(null) }} product={quickViewProduct} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Admin Password Prompt */}
      <AnimatePresence>
        {passwordPromptOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
              onClick={() => setPasswordPromptOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[81] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-sm bg-card rounded-2xl p-8 shadow-2xl border border-border/50 space-y-5">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">Admin Access</h2>
                  <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setAdminPasswordError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminPasswordSubmit()}
                    placeholder="Password"
                    autoFocus
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminPasswordError && (
                  <p className="text-xs text-red-500 -mt-2">{adminPasswordError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPasswordPromptOpen(false)}
                    className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminPasswordSubmit}
                    className="flex-1 h-10 rounded-xl gradient-gold text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
      <BottomNavBar onSearchClick={() => setSearchOpen(true)} onCartClick={() => setCartOpen(true)} onAuthClick={() => setAuthOpen(true)} onProfileClick={() => setProfileOpen(true)} />
      <BackToTop />
      <WhatsAppButton />
    </QueryClientProvider>
  )
}