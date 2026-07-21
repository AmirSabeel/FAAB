import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { ALL_PRODUCTS } from '@/data/products'

const FALLBACK_TRENDING_ITEMS = ALL_PRODUCTS.slice(0, 8).map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice || null,
  image: p.image,
  rating: p.rating || 4.8,
  reviewCount: p.reviewCount || 100,
  isNew: p.isNew || false,
}))

export async function GET() {
  try {
    const dbProducts = await db.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    const dbMapByName = new Map(dbProducts.map((p) => [p.name.toLowerCase().trim(), p]))
    const dbMapById = new Map(dbProducts.map((p) => [p.id, p]))

    const merged = FALLBACK_TRENDING_ITEMS.map((item) => {
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

    return NextResponse.json(merged)
  } catch (e) {
    console.error('Trending GET error:', e)
    return NextResponse.json(FALLBACK_TRENDING_ITEMS)
  }
}