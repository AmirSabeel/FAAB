'use client'

import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const kpiConfigs = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: DollarSign, format: (v: number) => `$${v.toLocaleString()}`, subtitle: '+12% from last month' },
  { key: 'orderCount', label: 'Total Orders', icon: ShoppingCart, format: (v: number) => v.toLocaleString(), subtitle: '+8% from last month' },
  { key: 'customerCount', label: 'Total Customers', icon: Users, format: (v: number) => v.toLocaleString(), subtitle: '+5% from last month' },
  { key: 'productCount', label: 'Total Products', icon: Package, format: (v: number) => v.toLocaleString(), subtitle: '2 new this week' },
] as const

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusBarColors: Record<string, string> = {
  pending: 'bg-amber-400',
  processing: 'bg-blue-400',
  shipped: 'bg-purple-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-red-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

interface DashboardData {
  totalRevenue: number
  orderCount: number
  customerCount: number
  productCount: number
  avgOrderValue: number
  recentOrders: {
    id: string
    orderNumber: string
    customerName: string
    status: string
    total: number
    itemCount: number
    createdAt: string
  }[]
  topProducts: {
    name: string
    sold: number
    revenue: number
  }[]
  statusBreakdown: {
    status: string
    count: number
  }[]
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
}

function KPICardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-5 md:p-6 shadow-luxury border border-border/50">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-28 mt-4" />
      <Skeleton className="h-3 w-24 mt-2" />
    </div>
  )
}

function KPICard({
  config,
  value,
  index,
}: {
  config: (typeof kpiConfigs)[number]
  value: number
  index: number
}) {
  const Icon = config.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className="bg-card rounded-2xl p-5 md:p-6 shadow-luxury border border-border/50"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gold" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-3">
        {config.label}
      </p>
      <p className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
        {config.format(value)}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{config.subtitle}</p>
    </motion.div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50 mt-6">
      <Skeleton className="h-6 w-40 mb-6" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-4 py-3 shadow-luxury">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
}

export function AdminDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: () => fetch('/api/admin/dashboard').then((r) => r.json()),
  })

  const statusMax = data
    ? Math.max(...data.statusBreakdown.map((s) => s.count), 1)
    : 1

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {kpiConfigs.map((config, index) => (
            <KPICard
              key={config.key}
              config={config}
              value={data[config.key as keyof DashboardData] as number}
              index={index}
            />
          ))}
        </div>
      ) : null}

      {/* Revenue Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50 mt-6"
        >
          <h2 className="text-lg font-semibold">Revenue Overview</h2>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data.monthlyRevenue.map((d) => ({
                  ...d,
                  month: formatMonth(d.month),
                }))}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a227" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a227" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a227"
                  strokeWidth={2}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : null}

      {/* Two Column: Recent Orders + Top Products */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50">
            <Skeleton className="h-6 w-32 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50">
            <Skeleton className="h-6 w-28 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link
                href="/?tab=orders"
                className="text-xs text-gold hover:text-gold-dark transition-colors flex items-center gap-1 font-medium"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground truncate">{order.customerName}</p>
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize shrink-0 mx-3',
                      statusColors[order.status] || 'bg-muted text-muted-foreground'
                    )}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold shrink-0">
                    ${order.total.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50"
          >
            <h2 className="text-lg font-semibold mb-4">Top Products</h2>
            <div className="max-h-96 overflow-y-auto">
              {data.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0"
                >
                  <span className="text-sm font-semibold text-muted-foreground w-6">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sold} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold ml-auto shrink-0">
                    ${product.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Order Status Breakdown */}
      {isLoading ? (
        <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50 mt-6">
          <Skeleton className="h-6 w-28 mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 flex-1 rounded-full" />
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </div>
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50 mt-6"
        >
          <h2 className="text-lg font-semibold mb-6">Order Status</h2>
          <div className="space-y-4">
            {data.statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-24 shrink-0 capitalize">
                  {statusLabels[item.status] || item.status}
                </span>
                <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max((item.count / statusMax) * 100, 2)}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      statusBarColors[item.status] || 'bg-muted-foreground'
                    )}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}