'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/admin-fetch'

// ---------- Types ----------

interface OrderItem {
  id: string
  productName: string
  productImage: string
  price: number
  quantity: number
  size: string | null
  color: string | null
}

interface OrderCustomer {
  name: string
  email: string
  phone: string | null
  city: string | null
  country: string | null
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
  customer: OrderCustomer
  items: OrderItem[]
}

// ---------- Status helpers ----------

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-500' },
  processing: { label: 'Processing', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-blue-500' },
  shipped: { label: 'Shipped', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500' },
  delivered: { label: 'Delivered', bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', border: 'border-green-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-500' },
}

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

const NEXT_STATUS: Record<string, { key: string; label: string; className: string }> = {
  pending: { key: 'processing', label: 'Process', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
  processing: { key: 'shipped', label: 'Ship', className: 'bg-purple-500 hover:bg-purple-600 text-white' },
  shipped: { key: 'delivered', label: 'Deliver', className: 'bg-green-500 hover:bg-green-600 text-white' },
}

// ---------- Component ----------

export function AdminOrders() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, status, page],
    queryFn: () =>
      adminFetch(`/api/admin/orders?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}`).then(
        (r) => r.json(),
      ),
  })

  const orders: Order[] = data?.orders ?? []
  const total = data?.total ?? 0

  const statusMutation = useMutation({
    mutationFn: ({ id, status: newStatus }: { id: string; status: string }) =>
      adminFetch('/api/admin/orders', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: newStatus }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated')
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const handleStatusChange = useCallback(
    (id: string, newStatus: string) => {
      statusMutation.mutate({ id, status: newStatus })
    },
    [statusMutation],
  )

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} order{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search order # or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.key
          const cfg = tab.key ? STATUS_CONFIG[tab.key] : null
          return (
            <button
              key={tab.key}
              onClick={() => {
                setStatus(tab.key)
                setPage(1)
              }}
              className={cn(
                'relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-xl',
                isActive
                  ? cfg
                    ? cn(cfg.text)
                    : 'text-gold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="order-status-tab"
                  className={cn(
                    'absolute bottom-0 left-2 right-2 h-0.5 rounded-full',
                    cfg ? cfg.border : 'bg-gold',
                  )}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl shadow-luxury border border-border/50 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-56 mt-3" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const isExpanded = expandedId === order.id
            const nextAction = NEXT_STATUS[order.status]

            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl shadow-luxury border border-border/50 overflow-hidden"
              >
                {/* Main Card */}
                <div className="p-5 md:p-6">
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <span className="text-sm font-semibold truncate">{order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground ml-3 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        cfg.bg,
                        cfg.text,
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="mt-2">
                    <p className="text-sm text-foreground font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 mt-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                    <span className="text-lg font-semibold">
                      ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="text-sm text-gold font-medium hover:underline flex items-center gap-1"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {nextAction && (
                        <button
                          onClick={() => handleStatusChange(order.id, nextAction.key)}
                          disabled={statusMutation.isPending}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
                            nextAction.className,
                          )}
                        >
                          {nextAction.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 border-t border-border/30">
                        {/* Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Customer Information
                            </h4>
                            <div className="space-y-1.5">
                              <p className="text-sm">{order.customer.name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                              {order.customer.phone && (
                                <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Shipping Address
                            </h4>
                            <div className="space-y-1.5">
                              {order.address && (
                                <p className="text-sm">{order.address}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {[order.city, order.country].filter(Boolean).join(', ') || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="mt-6">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                              >
                                <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.productName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {item.size && (
                                      <span className="text-xs text-muted-foreground">Size: {item.size}</span>
                                    )}
                                    {item.color && (
                                      <span className="text-xs text-muted-foreground">Color: {item.color}</span>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold whitespace-nowrap">
                                  ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals Breakdown */}
                        <div className="mt-6 max-w-xs ml-auto">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Shipping</span>
                              <span>
                                {order.shipping === 0
                                  ? 'Free'
                                  : `₹${order.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tax</span>
                              <span>₹{order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-border/30">
                              <span>Total</span>
                              <span>₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}