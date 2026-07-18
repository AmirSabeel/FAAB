'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileHover={{ scale: 1.1, boxShadow: '0 20px 60px oklch(0 0 0 / 0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className={cn(
            'fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50',
            'w-12 h-12 rounded-full',
            'bg-foreground text-background',
            'shadow-luxury-lg',
            'flex items-center justify-center',
            'transition-shadow duration-300',
            'dark:bg-background dark:text-foreground dark:border dark:border-border'
          )}
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function WhatsAppButton() {
  const handleClick = useCallback(() => {
    // Placeholder — replace with actual WhatsApp deep link
    window.open('#', '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      aria-label="Contact us on WhatsApp"
      className={cn(
        'fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50',
        'w-12 h-12 rounded-full',
        'bg-[#25D366] text-white',
        'shadow-luxury-lg',
        'flex items-center justify-center',
        'relative'
      )}
    >
      {/* Pulse ring animation */}
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-[#25D366]/40',
          'animate-ping'
        )}
        style={{ animationDuration: '3s' }}
        aria-hidden="true"
      />

      <MessageCircle className="w-5 h-5 relative z-10" strokeWidth={2} />
    </motion.button>
  );
}