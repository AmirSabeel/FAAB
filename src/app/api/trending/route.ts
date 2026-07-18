import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/trending — public endpoint for storefront
export async function GET() {
  const products = await db.product.findMany({
    where: { isTrending: true, status: 'active' },
    orderBy: { trendingOrder: 'asc' },
    take: 12,
  })
  return NextResponse.json(products)
}