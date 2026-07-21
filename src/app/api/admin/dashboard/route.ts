import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const [totalRevenue, orderCount, customerCount, productCount, recentOrders, topProducts, statusBreakdown] = await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
      db.order.count(),
      db.customer.count(),
      db.product.count(),
      db.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true, email: true } }, items: true } }),
      db.orderItem.groupBy({ by: ['productName'], _sum: { quantity: true, price: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
      db.order.groupBy({ by: ['status'], _count: true }),
    ])

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const monthlyOrders = await db.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: 'cancelled' } },
      select: { total: true, createdAt: true },
    })
    const monthlyRevenue: Record<string, number> = {}
    for (const o of monthlyOrders) {
      const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total
    }

    const avgOrderValue = orderCount > 0 ? (totalRevenue._sum.total || 0) / orderCount : 0

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total || 0,
      orderCount,
      customerCount,
      productCount,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        status: o.status,
        total: o.total,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
      topProducts: topProducts.map(p => ({
        name: p.productName,
        sold: p._sum.quantity,
        revenue: p._sum.price,
      })),
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count })),
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 })).sort(),
    })
  } catch (e) {
    console.error('dashboard GET error:', e)
    return NextResponse.json({
      totalRevenue: 0, orderCount: 0, customerCount: 0, productCount: 0,
      avgOrderValue: 0, recentOrders: [], topProducts: [], statusBreakdown: [], monthlyRevenue: [],
    })
  }
}
