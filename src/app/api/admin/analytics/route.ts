import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  // 1. Sales by category (from order items -> product category)
  const categorySalesRaw = await db.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true, price: true },
    where: { order: { status: { not: 'cancelled' } } },
  })

  const productIds = categorySalesRaw.map((i) => i.productId)
  const products = productIds.length > 0
    ? await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, category: true } })
    : []

  const categoryMap = new Map(products.map((p) => [p.id, p.category]))
  const categoryRevenue: Record<string, number> = {}
  for (const item of categorySalesRaw) {
    const cat = categoryMap.get(item.productId) || 'Other'
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item._sum.price || 0)
  }

  const GOLD_COLORS = ['#C5A55A', '#A68A3E', '#8B7335', '#D4B96E', '#E2CC8F', '#B8973D', '#9E8443']
  const categoryData = Object.entries(categoryRevenue)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: GOLD_COLORS[i % GOLD_COLORS.length],
    }))

  // 2. Orders over time (last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  const recentOrders = await db.order.findMany({
    where: { createdAt: { gte: fourteenDaysAgo } },
    select: { total: true, createdAt: true, status: true },
    orderBy: { createdAt: 'asc' },
  })

  const dayMap: Record<string, { orders: number; revenue: number }> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dayMap[key] = { orders: 0, revenue: 0 }
  }

  for (const o of recentOrders) {
    const key = o.createdAt.toISOString().split('T')[0]
    if (dayMap[key]) {
      dayMap[key].orders += 1
      dayMap[key].revenue += o.total
    }
  }

  const ordersData = Object.entries(dayMap).map(([date, data]) => {
    const d = new Date(date + 'T00:00:00')
    return {
      date: d.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
      orders: data.orders,
      revenue: Math.round(data.revenue),
    }
  })

  // 3. Customer growth (this month vs last month)
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [thisMonthCustomers, lastMonthCustomers] = await Promise.all([
    db.customer.count({ where: { createdAt: { gte: thisMonthStart } } }),
    db.customer.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
  ])

  const customerGrowth = {
    thisMonth: thisMonthCustomers,
    lastMonth: lastMonthCustomers,
    changePercent: lastMonthCustomers > 0
      ? Math.round(((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 1000) / 10
      : thisMonthCustomers > 0 ? 100 : 0,
  }

  // 4. Average order value (this month vs last month)
  const [thisMonthOrders, lastMonthOrders] = await Promise.all([
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: thisMonthStart }, status: { not: 'cancelled' } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart }, status: { not: 'cancelled' } },
    }),
  ])

  const avgThisMonth = (thisMonthOrders._count || 0) > 0
    ? Math.round((thisMonthOrders._sum.total || 0) / thisMonthOrders._count)
    : 0
  const avgLastMonth = (lastMonthOrders._count || 0) > 0
    ? Math.round((lastMonthOrders._sum.total || 0) / lastMonthOrders._count)
    : 0
  const avgChange = avgLastMonth > 0
    ? Math.round(((avgThisMonth - avgLastMonth) / avgLastMonth) * 1000) / 10
    : avgThisMonth > 0 ? 100 : 0

  return NextResponse.json({
    categoryData,
    ordersData,
    customerGrowth,
    avgOrderValue: {
      current: avgThisMonth,
      previous: avgLastMonth,
      changePercent: avgChange,
    },
  })
}