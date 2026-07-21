import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { ALL_PRODUCTS } from '@/data/products'

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

async function ensureDefaultProducts() {
  const count = await db.product.count()
  if (count === 0) {
    for (let i = 0; i < ALL_PRODUCTS.length; i++) {
      const p = ALL_PRODUCTS[i]
      await db.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || null,
          image: p.image,
          category: p.category,
          rating: p.rating || 4.8,
          reviewCount: p.reviewCount || 10,
          stock: 25,
          status: 'active',
          isFeatured: true,
          isNew: p.isNew || false,
          isTrending: p.id.startsWith('trend-'),
          trendingOrder: p.id.startsWith('trend-') ? i + 1 : 0,
          newArrivalOrder: p.id.startsWith('new-') ? i + 1 : 0,
          sizes: JSON.stringify(p.sizes || []),
          colors: JSON.stringify(p.colors || []),
        },
      }).catch(() => {})
    }
  }
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

  try {
    await ensureDefaultProducts()
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
  } catch (err) {
    console.error('Error in public products API:', err)
    return NextResponse.json({
      products: ALL_PRODUCTS,
      total: ALL_PRODUCTS.length,
      page: 1,
      totalPages: 1,
      categories: CATEGORIES,
    })
  }
}