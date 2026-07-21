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

// ── GET: Fetch user's wishlist from DB ────────────────────────────────────────

export async function GET() {
  const userId = await getUser()
  if (!userId) {
    return NextResponse.json({ items: [] })
  }

  const wishlistItems = await db.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    items: wishlistItems.map((item) => ({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      addedAt: item.createdAt.getTime(),
    })),
  })
}

// ── PUT: Sync entire wishlist (replace DB wishlist with client wishlist) ─────

export async function PUT(req: NextRequest) {
  const userId = await getUser()
  if (!userId) {
    return NextResponse.json({ items: [] })
  }

  const { items } = await req.json()
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items array' }, { status: 400 })
  }

  // Delete all existing wishlist items for this user
  await db.wishlistItem.deleteMany({ where: { userId } })

  // Insert new items
  if (items.length > 0) {
    await db.wishlistItem.createMany({
      data: items.map((item: { id: string; name: string; price: number; image: string; addedAt: number }) => ({
        userId,
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ success: true })
}