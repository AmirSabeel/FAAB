import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { orderStatusUpdateEmail } from '@/lib/email-templates'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
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
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

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
}