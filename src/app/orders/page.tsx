'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MapPin,
  Truck,
  Clock,
  CreditCard,
  ShoppingBag,
  Mail,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────

interface OrderItem {
  id: string
  productName: string
  productImage: string
  price: number
  quantity: number
  size: string | null
  color: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  address: string | null
  city: string | null
  country: string | null
  createdAt: string
  customer: { name: string; email: string; phone: string | null }
  items: OrderItem[]
}

const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

// ─── Status Config ───────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: ShoppingBag },
] as const

type StatusKey = (typeof STATUS_STEPS)[number]['key']

const STATUS_ORDER: Record<StatusKey, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  processing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  shipped: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

// ─── Status Timeline ─────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_ORDER[status as StatusKey] ?? 0
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
            This order has been cancelled
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
        <div
          className="absolute top-5 left-5 h-0.5 gradient-gold transition-all duration-700"
          style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, idx) => {
            const Icon = step.icon
            const isCompleted = idx <= currentIdx
            const isCurrent = idx === currentIdx

            return (
              <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: '20%' }}>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2',
                    isCompleted
                      ? 'gradient-gold border-gold text-white shadow-lg shadow-gold/20'
                      : 'bg-background border-border text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p
                  className={cn(
                    'text-[10px] sm:text-xs font-medium text-center transition-colors',
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Order Card ──────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const style = STATUS_STYLE[order.status] || STATUS_STYLE.pending

  const handleCopyNumber = useCallback(() => {
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    toast.success('Order number copied')
    setTimeout(() => setCopied(false), 2000)
  }, [order.orderNumber])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-3xl shadow-luxury border border-border/50 overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-muted/20 transition-colors cursor-pointer text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-semibold truncate">{order.orderNumber}</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopyNumber() }}
                className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                title="Copy order number"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Status Badge (visible on sm+) */}
          <span className={cn('text-xs font-medium px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5', style.bg, style.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="text-sm font-semibold">{formatINR(order.total)}</p>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Mobile status badge */}
      <div className="px-5 -mt-2 sm:hidden">
        <span className={cn('text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1.5', style.bg, style.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50">
              {/* Timeline */}
              <div className="px-5 md:px-6 pt-4">
                <StatusTimeline status={order.status} />
              </div>

              {/* Order Items */}
              <div className="px-5 md:px-6 pt-2 pb-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Items
                </p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' · '}
                          {item.color && `Color: ${item.color}`}
                          {!item.size && !item.color && `Qty: ${item.quantity}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatINR(item.price * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {formatINR(item.price)} × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="px-5 md:px-6 pb-4">
                <div className="bg-muted/40 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatINR(order.subtotal)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (GST)</span>
                      <span>{formatINR(order.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</span>
                  </div>
                  <div className="border-t border-border/50 pt-2 flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatINR(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.address && (
                <div className="px-5 md:px-6 pb-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                        Shipping Address
                      </p>
                      <p className="text-sm">{order.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {[order.city, order.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card rounded-3xl shadow-luxury border border-border/50 p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────

function EmptyState({ hasSearched }: { hasSearched: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
        <Package className="w-10 h-10 text-muted-foreground/30" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasSearched ? 'No orders found' : 'No orders yet'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasSearched
          ? 'We couldn\'t find any orders matching your search. Double-check your email, phone, or order number.'
          : 'Start shopping to see your orders here. We\'ll keep track of everything for you.'}
      </p>
      <Link
        href="/shop"
        className="px-6 py-3 rounded-2xl gradient-gold text-white text-sm font-medium btn-ripple hover:shadow-luxury-lg transition-all"
      >
        Browse Products
      </Link>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────

export default function OrdersPage() {
  const mounted = useHydrated()
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'orderNumber'>('email')
  const [searchValue, setSearchValue] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = useCallback(async () => {
    const trimmed = searchValue.trim()
    if (!trimmed) {
      toast.error('Please enter your email, phone, or order number')
      return
    }

    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (searchType === 'email') params.set('email', trimmed)
      else if (searchType === 'phone') params.set('phone', trimmed)
      else params.set('orderNumber', trimmed)

      const res = await fetch(`/api/orders/list?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Search failed')
      setOrders(data.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [searchType, searchValue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch()
    },
    [handleSearch]
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-sm font-semibold tracking-[0.2em] uppercase">My Orders</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl gradient-gold/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Track Your Orders
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Enter your email, phone number, or order number to view and track all your orders
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card rounded-3xl shadow-luxury border border-border/50 p-5 md:p-6 mb-8"
        >
          {/* Search Type Tabs */}
          <div className="flex items-center gap-1 mb-4">
            {([
              { key: 'email' as const, label: 'Email', icon: Mail },
              { key: 'phone' as const, label: 'Phone', icon: Phone },
              { key: 'orderNumber' as const, label: 'Order #', icon: CreditCard },
            ]).map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => { setSearchType(tab.key); setSearchValue('') }}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    searchType === tab.key
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Input + Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                placeholder={
                  searchType === 'email'
                    ? 'your@email.com'
                    : searchType === 'phone'
                      ? 'Phone number'
                      : 'FAAB-20260718-XXXXXX'
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/40 transition-all placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-11 px-6 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple disabled:opacity-50 shrink-0 cursor-pointer hover:shadow-luxury-lg transition-all"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 text-center mb-6"
          >
            {error}
          </motion.p>
        )}

        {/* Results */}
        {loading ? (
          <OrdersSkeleton />
        ) : hasSearched && orders.length === 0 ? (
          <EmptyState hasSearched />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Recent orders summary */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-3"
          >
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders over ₹2,999' },
              { icon: CreditCard, label: 'Secure Payment', desc: '100% protected' },
              { icon: Package, label: 'Easy Returns', desc: '30-day policy' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="text-center p-4 rounded-2xl bg-muted/30">
                <Icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="text-xs font-medium">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}