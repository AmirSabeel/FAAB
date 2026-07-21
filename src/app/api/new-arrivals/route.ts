import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { ALL_PRODUCTS } from '@/data/products'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FALLBACK_NEW_ITEMS = ALL_PRODUCTS.slice(8, 14).map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice || null,
  image: p.image,
  rating: p.rating || 4.8,
  reviewCount: p.reviewCount || 40,
  isNew: true,
}))

export async function GET() {
  try {
    const dbProducts = await db.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    const dbMapByName = new Map(dbProducts.map((p) => [p.name.toLowerCase().trim(), p]))
    const dbMapById = new Map(dbProducts.map((p) => [p.id, p]))

    const merged = FALLBACK_NEW_ITEMS.map((item) => {
      const match = dbMapByName.get(item.name.toLowerCase().trim()) || dbMapById.get(item.id)
      if (match) {
        return {
          id: match.id,
          name: match.name,
          price: match.price,
          originalPrice: match.originalPrice,
          image: match.image,
          rating: match.rating,
          reviewCount: match.reviewCount,
          isNew: match.isNew,
        }
      }
      return item
    })

    return NextResponse.json(merged, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  } catch (e) {
    console.error('New Arrivals GET error:', e)
    return NextResponse.json(FALLBACK_NEW_ITEMS, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  }
}