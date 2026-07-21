'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

// ---------- Types ----------

interface CategoryDataItem {
  name: string
  value: number
  color: string
}

interface OrdersDataItem {
  date: string
  orders: number
  revenue: number
}

interface AnalyticsData {
  categoryData: CategoryDataItem[]
  ordersData: OrdersDataItem[]
  customerGrowth: { thisMonth: number; lastMonth: number; changePercent: number }
  avgOrderValue: { current: number; previous: number; changePercent: number }
}

// ---------- Fallback empty state data ----------

const EMPTY_CHART: CategoryDataItem[] = [
  { name: 'No sales data yet', value: 1, color: 'oklch(0.7 0 0 / 0.15)' },
]

// ---------- Custom Tooltips ----------

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border/50 rounded-xl px-3 py-2 shadow-luxury text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
        <span className="font-medium">{payload[0].name}</span>
      </div>
      <p className="text-muted-foreground mt-0.5">
        {payload[0].value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border/50 rounded-xl px-3 py-2 shadow-luxury text-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {entry.dataKey === 'orders' ? 'Orders' : 'Revenue'}: {entry.dataKey === 'revenue' ? entry.value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : entry.value}
        </p>
      ))}
    </div>
  )
}

// ---------- Component ----------

export function AdminAnalytics() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics'],
    queryFn: () => adminFetch('/api/admin/analytics').then((r) => r.json()),
    refetchInterval: 30_000,
  })

  const categoryData = data?.categoryData?.length ? data.categoryData : EMPTY_CHART
  const ordersData = data?.ordersData || []
  const customerGrowth = data?.customerGrowth || { thisMonth: 0, lastMonth: 0, changePercent: 0 }
  const avgOrderValue = data?.avgOrderValue || { current: 0, previous: 0, changePercent: 0 }

  const formatINR = (n: number) =>
    n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[160px] rounded-2xl" />
            <Skeleton className="h-[160px] rounded-2xl" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-card rounded-2xl p-12 shadow-luxury border border-border/50 text-center">
          <p className="text-muted-foreground">Failed to load analytics data.</p>
        </div>
      ) : (
        <>
          {/* Section 1: Sales by Category */}
          <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50">
            <h3 className="text-lg font-bold tracking-tight">Sales by Category</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Revenue distribution across product categories</p>

            <div className="mt-6 flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full lg:w-1/2 space-y-3">
                {categoryData.length === 1 && categoryData[0].name === 'No sales data yet' ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No sales data available yet. Revenue will appear here once orders are placed.
                  </p>
                ) : (
                  categoryData.map((item) => {
                    const total = categoryData.reduce((s, c) => s + c.value, 0)
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{formatINR(item.value)}</span>
                          <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Orders Over Time */}
          <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Orders Over Time</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Daily orders for the last 14 days</p>
              </div>
            </div>

            <div className="mt-6 h-[320px]">
              {ordersData.every((d) => d.orders === 0) ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No orders in the last 14 days. Orders will appear here as they come in.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.1)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'oklch(0.7 0 0 / 0.2)' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }}
                      tickLine={false}
                      axisLine={false}
                      width={35}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'oklch(0.7 0 0 / 0.04)' }} />
                    <Bar dataKey="orders" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      {ordersData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill="url(#goldGradient)"
                        />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4B96E" />
                        <stop offset="100%" stopColor="#8B7335" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Section 3: Customer Growth + Avg Order Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Customers</p>
                  <p className="text-2xl font-bold">{customerGrowth.thisMonth}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    customerGrowth.changePercent >= 0
                      ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                  )}
                >
                  {customerGrowth.changePercent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {customerGrowth.changePercent >= 0 ? '+' : ''}
                  {customerGrowth.changePercent}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month ({customerGrowth.lastMonth})</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-luxury border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                  <BarChart3 className="w-4.5 h-4.5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                  <p className="text-2xl font-bold">{formatINR(avgOrderValue.current)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  avgOrderValue.changePercent >= 0
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                )}>
                  {avgOrderValue.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {avgOrderValue.changePercent >= 0 ? '+' : ''}
                  {avgOrderValue.changePercent}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month ({formatINR(avgOrderValue.previous)})</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}