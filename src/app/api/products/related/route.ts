import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  const limit = parseInt(searchParams.get('limit') || '4')

  // Find the product's category, then return products in the same category (excluding itself)
  const product = await db.product.findUnique({
    where: { id },
    select: { category: true },
  })

  if (!product) {
    return NextResponse.json({ products: [] })
  }

  const products = await db.product.findMany({
    where: {
      status: 'active',
      category: product.category,
      id: { not: id },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      originalPrice: true,
      image: true,
      category: true,
      rating: true,
      reviewCount: true,
      isNew: true,
      isFeatured: true,
    },
  })

  return NextResponse.json({ products })
}