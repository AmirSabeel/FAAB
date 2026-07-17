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
import { toast } from 'sonner'

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function Home() {
  const { isOpen, open, close, toggle } = useMobileNav()
  const [searchOpen, setSearchOpen] = useState(false)
  const mounted = useHydrated()

  // Lock body scroll when search or drawer is open
  useEffect(() => {
    if (searchOpen || isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [searchOpen, isOpen])

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
      />

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer isOpen={isOpen} onClose={close} />

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