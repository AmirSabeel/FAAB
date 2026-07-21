'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Truck,
  Shield,
  RefreshCw,
  Package,
  CreditCard,
  Lock,
  MapPin,
  User,
  Mail,
  Phone,
  ChevronRight,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/components/cart-drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────

interface CheckoutItem {
  id: string
  name: string
  price: number
  image: string
  size?: string
  color?: string
  quantity: number
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

// ─── Constants ───────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh',
]

const STEPS = [
  { label: 'Information', icon: User },
  { label: 'Shipping', icon: MapPin },
  { label: 'Payment', icon: CreditCard },
]

const TRUST_FEATURES = [
  { icon: Truck, text: 'Free shipping on orders over ₹2,999' },
  { icon: RefreshCw, text: '30-day hassle-free returns' },
  { icon: Shield, text: '100% secure payment' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// ─── Animation ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ─── Component ───────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [placing, setPlacing] = useState(false)
  const [orderComplete, setOrderComplete] = useState<{ orderNumber: string } | null>(null)

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod')

  const subtotal = totalPrice()
  const shippingCost = subtotal >= 2999 ? 0 : 149
  const taxRate = 18
  const taxAmount = Math.round(subtotal * taxRate / 100)
  const total = subtotal + shippingCost + taxAmount

  // Redirect if cart is empty and no order placed
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/')
    }
  }, [items, orderComplete, router])

  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }))
  }

  // ── Validation ──

  function isInfoValid(): boolean {
    return !!(customer.firstName.trim() && customer.lastName.trim() && customer.email.trim() && customer.phone.trim())
  }

  function isShippingValid(): boolean {
    return !!(customer.address.trim() && customer.city.trim() && customer.state.trim() && customer.pincode.trim())
  }

  function goNext() {
    if (step === 0 && !isInfoValid()) {
      toast.error('Please fill in all contact details')
      return
    }
    if (step === 1 && !isShippingValid()) {
      toast.error('Please fill in all shipping details')
      return
    }
    setDir(1)
    setStep((s) => Math.min(s + 1, 2))
  }

  function goBack() {
    setDir(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  // ── Place Order ──

  async function handlePlaceOrder() {
    if (placing) return
    setPlacing(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          customer: {
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            country: customer.country,
          },
          shipping: {
            rate: 149,
            free: true,
            threshold: 2999,
          },
          tax: {
            enabled: true,
            rate: taxRate,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      clearCart()
      setOrderComplete({ orderNumber: data.order.orderNumber })
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  // ── Order Confirmation ──

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          <div className="mt-8 bg-card rounded-2xl border border-border/50 p-6 shadow-luxury">
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Order Number</span>
              <span className="text-sm font-semibold font-mono">{orderComplete.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-full">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-semibold">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/orders"
              className="h-11 px-6 rounded-2xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center gap-2 hover:shadow-luxury-lg transition-all"
            >
              <Package className="w-4 h-4" />
              Track Order
            </Link>
            <Link
              href="/"
              className="h-11 px-6 rounded-2xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            A confirmation email has been sent to {customer.email}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ── */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Store</span>
          </Link>
          <span className="text-sm font-semibold tracking-[0.2em] uppercase">FAAB</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isComplete = i < step
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'gradient-gold text-white'
                        : 'bg-muted text-muted-foreground'
                  )}>
                    {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn(
                    'text-sm font-medium transition-colors hidden sm:block',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'w-12 md:w-20 h-px mx-3',
                    i < step ? 'bg-green-500' : 'bg-border'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ── Left: Form Steps ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait" custom={dir}>
              {/* Step 0: Contact Information */}
              {step === 0 && (
                <motion.div
                  key="info"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-luxury"
                >
                  <h2 className="text-lg font-semibold mb-1">Contact Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">We'll use this to send your order confirmation</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          value={customer.firstName}
                          onChange={(e) => updateCustomer('firstName', e.target.value)}
                          placeholder="John"
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={customer.lastName}
                        onChange={(e) => updateCustomer('lastName', e.target.value)}
                        placeholder="Doe"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={customer.email}
                          onChange={(e) => updateCustomer('email', e.target.value)}
                          placeholder="john@example.com"
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={customer.phone}
                          onChange={(e) => updateCustomer('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={goNext}
                    className="w-full mt-6 h-11 rounded-2xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continue to Shipping
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <motion.div
                  key="shipping"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-luxury"
                >
                  <h2 className="text-lg font-semibold mb-1">Shipping Address</h2>
                  <p className="text-sm text-muted-foreground mb-6">Where should we deliver your order?</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        value={customer.address}
                        onChange={(e) => updateCustomer('address', e.target.value)}
                        placeholder="House No., Street, Area"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          value={customer.city}
                          onChange={(e) => updateCustomer('city', e.target.value)}
                          placeholder="Mumbai"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">
                          State <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="state"
                          value={customer.state}
                          onChange={(e) => updateCustomer('state', e.target.value)}
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all cursor-pointer"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-sm font-medium">
                          PIN Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="pincode"
                          value={customer.pincode}
                          onChange={(e) => updateCustomer('pincode', e.target.value)}
                          placeholder="400001"
                          className="rounded-xl max-w-[200px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                        <Input
                          id="country"
                          value={customer.country}
                          onChange={(e) => updateCustomer('country', e.target.value)}
                          placeholder="India"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={goBack}
                      className="h-11 px-6 rounded-2xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={goNext}
                      className="flex-1 h-11 rounded-2xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  key="payment"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-luxury"
                >
                  <h2 className="text-lg font-semibold mb-1">Payment Method</h2>
                  <p className="text-sm text-muted-foreground mb-6">All transactions are secure and encrypted</p>

                  {/* Review Summary */}
                  <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                        <p className="text-sm font-medium">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-muted-foreground">{customer.email} · {customer.phone}</p>
                      </div>
                      <button onClick={() => { setDir(-1); setStep(0) }} className="text-xs text-gold hover:underline shrink-0 cursor-pointer">Edit</button>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ship to</p>
                        <p className="text-sm font-medium">{customer.address}</p>
                        <p className="text-xs text-muted-foreground">{customer.city}, {customer.state} {customer.pincode}</p>
                      </div>
                      <button onClick={() => { setDir(-1); setStep(1) }} className="text-xs text-gold hover:underline shrink-0 cursor-pointer">Edit</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Cash on Delivery */}
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer',
                        paymentMethod === 'cod'
                          ? 'border-gold bg-gold/5'
                          : 'border-border hover:border-border/80'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        paymentMethod === 'cod' ? 'bg-gold/10 text-gold' : 'bg-muted'
                      )}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay when your order arrives at your doorstep</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        paymentMethod === 'cod' ? 'border-gold' : 'border-border'
                      )}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                    </button>

                    {/* UPI */}
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer',
                        paymentMethod === 'upi'
                          ? 'border-gold bg-gold/5'
                          : 'border-border hover:border-border/80'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        paymentMethod === 'upi' ? 'bg-gold/10 text-gold' : 'bg-muted'
                      )}>
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">UPI Payment</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay via Google Pay, PhonePe, or any UPI app</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        paymentMethod === 'upi' ? 'border-gold' : 'border-border'
                      )}>
                        {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                    </button>

                    {/* Card */}
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer',
                        paymentMethod === 'card'
                          ? 'border-gold bg-gold/5'
                          : 'border-border hover:border-border/80'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        paymentMethod === 'card' ? 'bg-gold/10 text-gold' : 'bg-muted'
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Visa, Mastercard, RuPay accepted</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        paymentMethod === 'card' ? 'border-gold' : 'border-border'
                      )}>
                        {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-6 p-4 rounded-xl bg-muted/30 space-y-2">
                    {TRUST_FEATURES.map((f) => (
                      <div key={f.text} className="flex items-center gap-2.5">
                        <f.icon className="w-4 h-4 text-gold shrink-0" />
                        <span className="text-xs text-muted-foreground">{f.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={goBack}
                      className="h-11 px-6 rounded-2xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="flex-1 h-11 rounded-2xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {placing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Place Order — {formatPrice(total)}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-luxury lg:sticky lg:top-24">
              <h3 className="text-base font-semibold mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' · '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <p className="text-sm font-semibold mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-border/50 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(2999 - subtotal)} more for free shipping
                    </p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-gold rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / 2999) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {shippingCost === 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <Check className="w-3.5 h-3.5" />
                    You qualify for free shipping!
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST {taxRate}%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-semibold text-gold">{formatPrice(total)}</span>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                {TRUST_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    <f.icon className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span className="text-xs text-muted-foreground">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Need Smartphone icon for UPI
function Smartphone(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}