import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session.user.id as string
}

// ── GET: Fetch user's cart from DB ────────────────────────────────────────────

export async function GET() {
  const userId = await getUser()
  if (!userId) {
    return NextResponse.json({ items: [] })
  }

  const cartItems = await db.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    items: cartItems.map((item) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.size || undefined,
      color: item.color || undefined,
      quantity: item.quantity,
    })),
  })
}

// ── PUT: Sync entire cart (replace DB cart with client cart) ──────────────────

export async function PUT(req: NextRequest) {
  const userId = await getUser()
  if (!userId) {
    return NextResponse.json({ items: [] })
  }

  const { items } = await req.json()
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items array' }, { status: 400 })
  }

  // Delete all existing cart items for this user
  await db.cartItem.deleteMany({ where: { userId } })

  // Insert new items (if any)
  if (items.length > 0) {
    await db.cartItem.createMany({
      data: items.map((item: { id: string; name: string; price: number; image: string; size?: string; color?: string; quantity: number }) => ({
        userId,
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size || null,
        color: item.color || null,
        quantity: item.quantity,
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ success: true })
}

// ── DELETE: Clear user's cart (called after successful order) ─────────────────

export async function DELETE() {
  const userId = await getUser()
  if (!userId) {
    return NextResponse.json({ success: true })
  }

  await db.cartItem.deleteMany({ where: { userId } })
  return NextResponse.json({ success: true })
}