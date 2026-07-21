import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const [totalRevenue, orderCount, customerCount, productCount, recentOrders, topProductsRaw, statusBreakdownRaw] = await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
      db.order.count(),
      db.customer.count(),
      db.product.count(),
      db.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true, email: true } }, items: true } }),
      db.orderItem.groupBy({ by: ['productName'], _sum: { quantity: true, price: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }).catch(() => []),
      db.order.groupBy({ by: ['status'], _count: true }).catch(() => []),
    ])
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const monthlyOrders = await db.order.findMany({ where: { createdAt: { gte: sixMonthsAgo }, status: { not: 'cancelled' } }, select: { total: true, createdAt: true } })
    const monthlyRevenue: Record<string, number> = {}
    for (const o of monthlyOrders) {
      const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total
    }
    const revenueVal = totalRevenue?._sum?.total || 0
    const countVal = orderCount || 0
    return NextResponse.json({
      totalRevenue: revenueVal, orderCount: countVal, customerCount: customerCount || 0, productCount: productCount || 0,
      avgOrderValue: countVal > 0 ? Math.round((revenueVal / countVal) * 100) / 100 : 0,
      recentOrders: (recentOrders || []).map(o => ({ id: o.id, orderNumber: o.orderNumber, customerName: o.customer?.name || 'Guest', status: o.status, total: o.total, itemCount: o.items?.length || 0, createdAt: o.createdAt })),
      topProducts: (topProductsRaw || []).map(p => ({ name: p.productName, sold: p._sum?.quantity || 0, revenue: p._sum?.price || 0 })),
      statusBreakdown: (statusBreakdownRaw || []).map(s => ({ status: s.status, count: typeof s._count === 'number' ? s._count : 0 })),
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 })).sort(),
    })
  } catch (e) {
    console.error('dashboard GET error:', e)
    return NextResponse.json({ totalRevenue: 0, orderCount: 0, customerCount: 0, productCount: 0, avgOrderValue: 0, recentOrders: [], topProducts: [], statusBreakdown: [], monthlyRevenue: [] })
  }
}
