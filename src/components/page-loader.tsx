'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const letters = 'FAAB'.split('');

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const fadeOutVariants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeIn', delay: 0.1 },
  },
};

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [showLetters, setShowLetters] = useState(true);

  useEffect(() => {
    // After letters animate in (~1.2s) + short hold, start fade out
    const fadeTimer = setTimeout(() => {
      setShowLetters(false);
    }, 1800);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={fadeOutVariants}
          initial="visible"
          exit="exit"
          className={cn(
            'fixed inset-0 z-[200]',
            'bg-background',
            'flex items-center justify-center'
          )}
        >
          <div className="flex items-center gap-0.5">
            {letters.map((letter, i) => (
              <motion.span
                key={`${letter}-${i}`}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate={showLetters ? 'visible' : 'hidden'}
                className={cn(
                  'text-2xl font-semibold',
                  'tracking-[0.3em] uppercase',
                  'text-foreground'
                )}
                style={{
                  display: 'inline-block',
                  minWidth: '0.65em',
                  textAlign: 'center',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}