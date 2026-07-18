import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || ''
  const phone = searchParams.get('phone') || ''
  const orderNumber = searchParams.get('orderNumber') || ''

  // Build where clause
  const where: Record<string, unknown> = {}

  if (orderNumber) {
    where.orderNumber = orderNumber
  } else if (email || phone) {
    const customerWhere: Record<string, unknown> = {}
    if (email) customerWhere.email = email
    if (phone) customerWhere.phone = phone
    where.customer = customerWhere
  } else {
    return NextResponse.json({ error: 'Provide email, phone, or order number' }, { status: 400 })
  }

  try {
    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        customer: { select: { name: true, email: true, phone: true } },
      },
    })

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        address: o.address,
        city: o.city,
        country: o.country,
        createdAt: o.createdAt,
        customer: o.customer,
        items: o.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      })),
    })
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}