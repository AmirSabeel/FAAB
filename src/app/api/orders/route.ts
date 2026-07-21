import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { orderConfirmationEmail } from '@/lib/email-templates'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customer, shipping, tax } = body

    if (!items?.length || !customer?.name || !customer?.email) {
      return NextResponse.json({ error: 'Items and customer info are required' }, { status: 400 })
    }

    // Get session to link order to user if logged in
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)
    const taxAmount = tax?.enabled ? Math.round(subtotal * (tax.rate || 18) / 100) : 0
    const shippingAmount = shipping?.free && subtotal >= (shipping.threshold || 2999) ? 0 : (shipping.rate || 149)
    const total = subtotal + taxAmount + shippingAmount

    // Find or create customer
    let customerRecord = await db.customer.findUnique({ where: { email: customer.email } })
    if (!customerRecord) {
      customerRecord = await db.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || null,
          city: customer.city || null,
          country: customer.country || null,
          totalSpent: total,
          orderCount: 1,
        },
      })
    } else {
      customerRecord = await db.customer.update({
        where: { email: customer.email },
        data: {
          totalSpent: { increment: total },
          orderCount: { increment: 1 },
          phone: customer.phone || customerRecord.phone,
          city: customer.city || customerRecord.city,
          country: customer.country || customerRecord.country,
        },
      })
    }

    // Generate order number
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase()
    const orderNumber = `FAAB-${datePart}-${randomPart}`

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        userId,
        status: 'pending',
        total,
        subtotal,
        shipping: shippingAmount,
        tax: taxAmount,
        address: customer.address || null,
        city: customer.city || null,
        country: customer.country || null,
        items: {
          create: items.map((item: { id: string; name: string; image: string; price: number; quantity: number; size?: string; color?: string }) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
          })),
        },
      },
      include: { items: true, customer: { select: { name: true, email: true } } },
    })

    // Decrease stock for each product
    for (const item of items) {
      try {
        await db.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        })
      } catch {
        // Product might not exist in DB (demo products) — skip stock update
      }
    }

    // Send order confirmation email (fire-and-forget, non-blocking)
    sendEmail({
      to: customer.email,
      subject: `Order Confirmed \u2014 ${orderNumber}`,
      html: orderConfirmationEmail({
        orderNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        items: items.map((item: { name: string; price: number; quantity: number; size?: string; color?: string }) => item),
        subtotal,
        shipping: shippingAmount,
        tax: taxAmount,
        total,
        address: customer.address,
        city: customer.city,
        country: customer.country,
      }),
    }).catch(() => { /* email failure should not block order */ })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        customer: { name: customerRecord.name, email: customerRecord.email },
      },
    })
  } catch (error) {
    console.error('Place order error:', error)
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 })
  }
}