'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const panelVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 28, stiffness: 320 },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.97,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when tab changes
  useEffect(() => {
    setTab(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    setErrors({})
    setName('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
  }, [tab])

  // Lock body scroll + Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (tab === 'signup' && !name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [tab, name, email, password])

  const handleLogin = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const msg = result.error.includes('email')
          ? result.error
          : result.error.includes('password')
            ? result.error
            : 'Invalid email or password'
        setErrors({ form: msg })
        return
      }

      toast.success('Welcome back!', { description: `Signed in as ${email}`, duration: 3000 })
      onClose()
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }, [email, password, validate, onClose])

  const handleSignup = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ form: data.error || 'Registration failed' })
        return
      }

      toast.success('Account created!', { description: 'Welcome to FAAB. Signing you in...', duration: 3000 })

      // Auto sign in after registration
      await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      onClose()
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }, [name, email, password, validate, onClose])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (tab === 'login') handleLogin()
      else handleSignup()
    },
    [tab, handleLogin, handleSignup]
  )

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={tab === 'login' ? 'Sign in' : 'Create account'}
        >
          <motion.div
            key={tab}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-background rounded-3xl shadow-luxury-xl w-full max-w-md overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-2">
              <p className="text-xs text-gold font-medium tracking-[0.2em] uppercase mb-3">
                FAAB
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {tab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                {tab === 'login'
                  ? 'Sign in to access your orders, wishlist & more'
                  : 'Join FAAB for an exclusive luxury experience'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="px-8 pt-4">
              <div className="flex bg-muted rounded-2xl p-1 relative">
                <motion.div
                  className="absolute top-1 bottom-1 rounded-xl bg-background shadow-sm"
                  animate={{ left: tab === 'login' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
                <button
                  onClick={() => setTab('login')}
                  className={cn(
                    'relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer',
                    tab === 'login' ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setTab('signup')}
                  className={cn(
                    'relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer',
                    tab === 'signup' ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-4">
              {/* Form Error */}
              <AnimatePresence>
                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-2.5"
                  >
                    {errors.form}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name Field (signup only) */}
              <AnimatePresence>
                {tab === 'signup' && (
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, height: 0 }}
                    custom={0}
                  >
                    <label htmlFor="auth-name" className="block text-sm font-medium mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className={cn(
                          'w-full pl-11 pr-4 py-3 rounded-2xl border bg-background text-sm transition-colors outline-none',
                          'placeholder:text-muted-foreground/50',
                          errors.name
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-border focus:border-gold'
                        )}
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={tab === 'signup' ? 1 : 0}
              >
                <label htmlFor="auth-email" className="block text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={cn(
                      'w-full pl-11 pr-4 py-3 rounded-2xl border bg-background text-sm transition-colors outline-none',
                      'placeholder:text-muted-foreground/50',
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-border focus:border-gold'
                    )}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={tab === 'signup' ? 2 : 1}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-sm font-medium">
                    Password
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => toast.info('Password reset coming soon!')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Your password'}
                    className={cn(
                      'w-full pl-11 pr-12 py-3 rounded-2xl border bg-background text-sm transition-colors outline-none',
                      'placeholder:text-muted-foreground/50',
                      errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-border focus:border-gold'
                    )}
                    autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                custom={tab === 'signup' ? 3 : 2}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer',
                    'bg-foreground text-background hover:bg-gold hover:text-white',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {tab === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Switch Mode */}
              <p className="text-center text-sm text-muted-foreground">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
                  className="text-gold font-medium hover:underline cursor-pointer"
                >
                  {tab === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}