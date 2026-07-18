import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  'Accessories',
  'Footwear',
  'Jewelry',
  'Watches',
]

const SORT_MAP: Record<string, Record<string, string>> = {
  newest: { createdAt: 'desc' },
  'price-asc': { price: 'asc' },
  'price-desc': { price: 'desc' },
  name: { name: 'asc' },
  rating: { rating: 'desc' },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const onSale = searchParams.get('sale') === 'true'

  const where: Record<string, unknown> = { status: 'active' }

  if (category && category !== 'All') {
    where.category = category
  }
  if (search) {
    where.name = { contains: search }
  }
  if (onSale) {
    where.originalPrice = { not: null }
  }

  const orderBy = SORT_MAP[sort] || { createdAt: 'desc' }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
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
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories: CATEGORIES,
  })
}