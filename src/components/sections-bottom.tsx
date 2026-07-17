'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowRight,
  Quote,
  Truck,
  RefreshCw,
  Shield,
  Headphones,
  Instagram,
  Twitter,
  Facebook,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ================================================================
   SCROLL REVEAL HELPER
   ================================================================ */

function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   ANIMATED COUNTER HELPER
   ================================================================ */

function AnimatedCounter({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ================================================================
   SECTION HEADING HELPER
   ================================================================ */

function SectionHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('text-center mb-12 md:mb-16', className)}>
      <ScrollReveal>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground mt-3 text-sm md:text-base max-w-md mx-auto">
            {subtitle}
          </p>
        )}
      </ScrollReveal>
    </div>
  );
}

/* ================================================================
   1. PROMO BANNER
   ================================================================ */

export function PromoBanner() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative w-full bg-foreground text-background dark:bg-background dark:text-foreground overflow-hidden">
      {/* Diagonal stripe pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            currentColor,
            currentColor 1px,
            transparent 1px,
            transparent 24px
          )`,
        }}
      />

      {/* MAISON watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[10vw] md:text-[14vw] font-bold tracking-[0.2em] opacity-[0.04] leading-none uppercase">
          MAISON
        </span>
      </div>

      {/* Decorative gold line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-gold" />

      <div className="relative z-10 py-16 md:py-24 px-6">
        <ScrollReveal className="text-center">
          <span className="inline-block text-gold tracking-[0.3em] uppercase text-xs font-medium">
            Limited Time
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight mt-4">
            Summer Sale Up to 40% Off
          </h2>
          <p className="text-muted-foreground dark:text-foreground/60 mt-4 max-w-xl mx-auto text-base md:text-lg">
            Discover curated pieces at exceptional prices. Elevate your
            wardrobe with our most anticipated sale of the season.
          </p>
          <motion.div
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="inline-block"
          >
            <motion.a
              href="#"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-full bg-gold text-white hover:bg-gold-dark font-medium transition-colors btn-ripple"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Shop the Sale
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Bottom decorative gold line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-gold" />
    </section>
  );
}

/* ================================================================
   2. CUSTOMER REVIEWS
   ================================================================ */

const reviews = [
  {
    name: 'Sarah Mitchell',
    title: 'Fashion Stylist',
    initials: 'SM',
    text: 'MAISON has completely transformed my wardrobe. The quality of each piece is exceptional, and the curation is impeccable.',
  },
  {
    name: 'James Chen',
    title: 'Creative Director',
    initials: 'JC',
    text: 'The attention to detail in every garment speaks volumes about their commitment to excellence. A truly premium experience.',
  },
  {
    name: 'Emma Rodriguez',
    title: 'Interior Designer',
    initials: 'ER',
    text: 'Not just fashion — MAISON represents a lifestyle. Their aesthetic perfectly aligns with modern luxury living.',
  },
  {
    name: 'David Kim',
    title: 'Entrepreneur',
    initials: 'DK',
    text: 'From the website experience to the packaging, everything about MAISON screams sophistication. Absolutely love it.',
  },
  {
    name: 'Olivia Thompson',
    title: 'Model',
    initials: 'OT',
    text: 'The fabrics, the fit, the finish — everything is on another level. MAISON is my go-to for premium fashion.',
  },
];

function ReviewCard({
  review,
}: {
  review: (typeof reviews)[number];
}) {
  return (
    <div className="relative min-w-[300px] md:min-w-[380px] bg-card rounded-3xl p-6 md:p-8 shadow-luxury flex-shrink-0">
      {/* Decorative quote icon */}
      <Quote className="absolute top-4 right-6 text-gold/20 w-12 h-12" />

      {/* Gold stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className="w-4 h-4 text-gold fill-gold"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
      </div>

      {/* Review text */}
      <p className="text-foreground/80 text-sm md:text-base leading-relaxed mt-4">
        {review.text}
      </p>

      {/* Reviewer */}
      <div className="flex items-center gap-3 mt-6">
        <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {review.initials}
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{review.name}</p>
          <p className="text-muted-foreground text-xs">{review.title}</p>
        </div>
      </div>
    </div>
  );
}

export function CustomerReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll using CSS animation
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading title="What Our Clients Say" />

        <ScrollReveal>
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef}
              className="flex gap-6 no-scrollbar overflow-x-auto"
              style={{
                animation: isPaused
                  ? 'none'
                  : 'scrollReviews 40s linear infinite',
              }}
            >
              {/* Duplicate reviews for seamless loop */}
              {[...reviews, ...reviews].map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>

            {/* Inline keyframes for auto-scroll */}
            <style jsx>{`
              @keyframes scrollReviews {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ================================================================
   3. FEATURES SECTION
   ================================================================ */

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Complimentary delivery on all orders over ₹16,600',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free return policy',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Bank-level encryption for all transactions',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Personal style consultants at your service',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="The MAISON Experience"
          subtitle="Why discerning customers choose us"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1}>
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto text-gold">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   4. ANIMATED STATS
   ================================================================ */

const stats = [
  { target: 50, suffix: 'K+', label: 'Happy Customers' },
  { target: 200, suffix: '+', label: 'Designer Brands' },
  { target: 15, suffix: '+', label: 'Countries Served' },
  { target: 99, suffix: '%', label: 'Satisfaction Rate' },
];

export function AnimatedStats() {
  return (
    <section className="py-12 md:py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <ScrollReveal key={stat.label}>
              <div className="text-center">
                <span className="text-3xl md:text-4xl font-semibold text-foreground">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </span>
                <p className="text-muted-foreground text-sm mt-1">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   5. NEWSLETTER SECTION
   ================================================================ */

export function NewsletterSection() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="glass-card rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground">
              Stay in the Loop
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm md:text-base">
              Subscribe for exclusive access to new collections, special
              offers, and style inspiration.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                className="flex-1 h-12 px-5 rounded-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all"
              />
              <motion.button
                type="submit"
                className="h-12 px-8 rounded-full gradient-gold text-white font-medium btn-ripple hover:shadow-luxury-lg transition-shadow whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Subscribe
              </motion.button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ================================================================
   6. FAQ SECTION
   ================================================================ */

const faqs = [
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached. Free return shipping is provided for all domestic orders.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Standard delivery takes 3-5 business days. Express shipping is available for 1-2 day delivery. International orders typically arrive within 7-14 business days.',
  },
  {
    question: 'Do you offer international shipping?',
    answer:
      'Yes, we ship to over 15 countries worldwide. Shipping rates and delivery times vary by location. Free international shipping on orders over ₹41,500.',
  },
  {
    question: 'How can I track my order?',
    answer:
      "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order through your account dashboard.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All transactions are secured with bank-level encryption.',
  },
  {
    question: 'Do you offer gift wrapping?',
    answer:
      'Yes! Complimentary premium gift wrapping is available on all orders. You can add a personal message during checkout.',
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeading title="Frequently Asked Questions" />

        <ScrollReveal>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card rounded-2xl border border-border px-6 data-[state=open]:shadow-luxury transition-shadow"
              >
                <AccordionTrigger className="text-sm md:text-base font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ================================================================
   7. FOOTER
   ================================================================ */

const footerShopLinks = [
  'New Arrivals',
  'Women',
  'Men',
  'Accessories',
  'Sale',
  'Gift Cards',
];

const footerCompanyLinks = [
  'About Us',
  'Careers',
  'Sustainability',
  'Press',
  'Stores',
];

const footerSupportLinks = [
  'Contact Us',
  'FAQ',
  'Shipping',
  'Returns',
  'Size Guide',
];

const socialIcons = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Bookmark, label: 'Pinterest' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background dark:bg-card dark:text-foreground pt-16 pb-8 px-6 safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <span className="inline-block tracking-[0.3em] uppercase font-semibold text-lg">
              MAISON
            </span>
            <p className="text-foreground/60 dark:text-foreground/50 text-sm mt-3 max-w-xs">
              Redefining luxury fashion for the modern connoisseur.
            </p>

            {/* Social icons */}
            <div className="flex gap-2 mt-5">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-foreground/10 dark:bg-foreground/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/20 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground/80 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerShopLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-foreground/60 dark:text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground/80 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerCompanyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-foreground/60 dark:text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground/80 mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {footerSupportLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-foreground/60 dark:text-foreground/50 hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/40">
          <span>&copy; 2026 MAISON. All rights reserved.</span>
          <div className="flex gap-3">
            <a
              href="#"
              className="hover:text-foreground/70 transition-colors"
            >
              Privacy Policy
            </a>
            <span aria-hidden="true">&middot;</span>
            <a
              href="#"
              className="hover:text-foreground/70 transition-colors"
            >
              Terms of Service
            </a>
            <span aria-hidden="true">&middot;</span>
            <a
              href="#"
              className="hover:text-foreground/70 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}