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

const FALLBACK_PUBLIC_PRODUCTS = ALL_PRODUCTS.map((p, i) => ({
  id: p.id || `prod-${i + 1}`,
  name: p.name,
  description: p.description,
  price: p.price,
  originalPrice: p.originalPrice || null,
  image: p.image,
  category: p.category,
  rating: p.rating || 4.8,
  reviewCount: p.reviewCount || 10,
  isNew: p.isNew || false,
  isFeatured: true,
}))

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const search = (searchParams.get('search') || '').toLowerCase().trim()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const onSale = searchParams.get('sale') === 'true'

  try {
    const dbProducts = await db.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    const dbMapByName = new Map(dbProducts.map((p) => [p.name.toLowerCase().trim(), p]))
    const dbMapById = new Map(dbProducts.map((p) => [p.id, p]))

    const mergedList: Array<any> = []
    const processedDbIds = new Set<string>()

    for (const fallback of FALLBACK_PUBLIC_PRODUCTS) {
      const match = dbMapByName.get(fallback.name.toLowerCase().trim()) || dbMapById.get(fallback.id)
      if (match) {
        mergedList.push({
          id: match.id,
          name: match.name,
          price: match.price,
          originalPrice: match.originalPrice,
          image: match.image,
          category: match.category,
          rating: match.rating,
          reviewCount: match.reviewCount,
          isNew: match.isNew,
          isFeatured: match.isFeatured,
        })
        processedDbIds.add(match.id)
      } else {
        mergedList.push(fallback)
      }
    }

    for (const dbP of dbProducts) {
      if (!processedDbIds.has(dbP.id)) {
        mergedList.push({
          id: dbP.id,
          name: dbP.name,
          price: dbP.price,
          originalPrice: dbP.originalPrice,
          image: dbP.image,
          category: dbP.category,
          rating: dbP.rating,
          reviewCount: dbP.reviewCount,
          isNew: dbP.isNew,
          isFeatured: dbP.isFeatured,
        })
      }
    }

    let filtered = mergedList
    if (category && category !== 'All' && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category)
    }
    if (search) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search))
    }
    if (onSale) {
      filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price)
    }

    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      products: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      categories: CATEGORIES,
    })
  } catch (err) {
    console.error('Error in public products API:', err)
    return NextResponse.json({
      products: FALLBACK_PUBLIC_PRODUCTS,
      total: FALLBACK_PUBLIC_PRODUCTS.length,
      page: 1,
      totalPages: 1,
      categories: CATEGORIES,
    })
  }
}