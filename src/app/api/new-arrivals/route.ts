import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/new-arrivals — public endpoint for storefront
export async function GET() {
  const products = await db.product.findMany({
    where: { newArrivalOrder: { gt: 0 }, status: 'active' },
    orderBy: { newArrivalOrder: 'asc' },
    take: 12,
  })
  return NextResponse.json(products)
}