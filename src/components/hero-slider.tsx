'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Slide Data ───────────────────────────────────────────────────────────────

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

const slides: Slide[] = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    title: 'The New\nSeason Arrives',
    subtitle:
      'Discover the latest collection of timeless pieces crafted with meticulous attention to detail and refined elegance.',
    ctaText: 'Shop Now',
    ctaLink: '/collections/new-arrivals',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    title: 'Curated\nLuxury',
    subtitle:
      'Explore handpicked selections from the world\'s most coveted fashion houses and emerging designers.',
    ctaText: 'Explore Collection',
    ctaLink: '/collections/curated',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    title: 'Define\nYour Style',
    subtitle:
      'From runway to everyday — express your individuality with pieces that speak louder than words.',
    ctaText: 'Discover More',
    ctaLink: '/collections/trending',
  },
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideContentVariants = {
  hidden: {},
  visible: {},
  exit: {},
}

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

const subtitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const glassCardVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [heroHeight, setHeroHeight] = useState(0)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const heroRef = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()
  const imageY = useTransform(scrollY, [0, heroHeight], [0, heroHeight * 0.3])

  useEffect(() => {
    if (heroRef.current) setHeroHeight(heroRef.current.offsetHeight)
  }, [])

  const totalSlides = slides.length
  const slide = slides[currentSlide]

  // ── Navigation ───────────────────────────────────────────────────────────

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide((index + totalSlides) % totalSlides)
    },
    [totalSlides]
  )

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // ── Auto-play (pauses on hover) ─────────────────────────────────────────

  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      goNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [isHovered, goNext])

  // ── Touch / Swipe Support ────────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) goNext()
    else if (isRightSwipe) goPrev()

    touchStartX.current = null
    touchEndX.current = null
  }, [goNext, goPrev])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Hero image slider"
      aria-roledescription="carousel"
    >
      {/* ── Background Images ─────────────────────────────────────────────── */}
      {slides.map((s, index) => (
        <motion.div
          key={s.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
          )}
          aria-hidden={index !== currentSlide}
          style={{ y: imageY, willChange: 'transform' }}
        >
          <img
            src={s.image}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
            style={{ willChange: 'opacity, transform' }}
            aria-hidden="true"
          />
        </motion.div>
      ))}

      {/* ── Gradient Overlay ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Slide Content (AnimatePresence) ───────────────────────────────── */}
      <div className="relative z-[2] flex items-center h-full">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
            {/* Left side: Text content */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  variants={slideContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="max-w-lg"
                  aria-roledescription="slide"
                  aria-label={`Slide ${currentSlide + 1} of ${totalSlides}`}
                >
                  {/* Title */}
                  <motion.h1
                    variants={titleVariants}
                    className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1] whitespace-pre-line"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {slide.title}
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    variants={subtitleVariants}
                    className="text-base md:text-lg text-white/80 mt-4 max-w-md"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {slide.subtitle}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    variants={ctaVariants}
                    className="mt-8"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <a
                      href={slide.ctaLink}
                      className={cn(
                        'btn-ripple group',
                        'inline-flex items-center gap-2 rounded-full px-8 py-3.5',
                        'bg-white text-black font-medium text-sm md:text-base',
                        'transition-colors duration-300',
                        'hover:bg-gold hover:text-white',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black'
                      )}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right side: Glass Card (desktop only) */}
            <div className="lg:col-span-5 xl:col-span-4 hidden lg:flex justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${slide.id}`}
                  variants={glassCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="glass-card rounded-2xl p-5 w-64 shadow-luxury-lg"
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4">
                    <img
                      src={
                        slides[(currentSlide + 1) % totalSlides].image
                      }
                      alt="New Collection preview"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <h3 className="text-white font-semibold text-sm tracking-wide uppercase">
                    New Collection
                  </h3>
                  <a
                    href="/collections/new-arrivals"
                    className="inline-flex items-center gap-1.5 text-gold text-sm mt-1.5 hover:gap-2.5 transition-all duration-300"
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Arrows (desktop only) ──────────────────────────────── */}
      <button
        type="button"
        onClick={goPrev}
        className={cn(
          'hidden md:flex absolute left-5 lg:left-8 top-1/2 -translate-y-1/2 z-10',
          'w-10 h-10 items-center justify-center rounded-full',
          'glass text-white/90 hover:text-white',
          'transition-all duration-300 hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
        )}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={goNext}
        className={cn(
          'hidden md:flex absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 z-10',
          'w-10 h-10 items-center justify-center rounded-full',
          'glass text-white/90 hover:text-white',
          'transition-all duration-300 hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
        )}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Dot Indicators ────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5"
        role="tablist"
        aria-label="Slide navigation"
      >
        {slides.map((s, index) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={cn(
              'rounded-full transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              index === currentSlide
                ? 'w-8 h-2.5 bg-gold'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>

      {/* ── Slide Counter (desktop only, subtle) ──────────────────────────── */}
      <div className="hidden md:block absolute bottom-8 right-8 lg:right-12 z-10 text-white/50 text-xs font-mono tracking-widest">
        <span className="text-white/90 font-medium">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="mx-1.5">/</span>
        <span>{String(totalSlides).padStart(2, '0')}</span>
      </div>
    </section>
  )
}