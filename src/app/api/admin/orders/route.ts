import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { orderStatusUpdateEmail } from '@/lib/email-templates'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customer: { name: { contains: search } } },
    ]
  }

  try {
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true, phone: true, city: true, country: true } },
          items: true,
        },
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Error fetching admin orders:', err)
    return NextResponse.json({ orders: [], total: 0, page: 1, totalPages: 1 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const { id, status } = body
    if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 })

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { customer: { select: { name: true, email: true } } },
    })

    // Send status update email (fire-and-forget)
    if (order.customer?.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Order Update — ${order.orderNumber}`,
        html: orderStatusUpdateEmail({
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          newStatus: status,
        }),
      }).catch(() => { /* email failure should not block status update */ })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error('Error updating order status:', err)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}