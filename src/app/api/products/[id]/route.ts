import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

function safeParseJSON<T>(str: string, fallback: T): T {
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const product = await db.product.findUnique({
    where: { id },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    images: [product.image],
    category: product.category,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    sizes: safeParseJSON<string[]>(product.sizes, []),
    colors: safeParseJSON<{ name: string; hex: string }[]>(product.colors, []),
  })
}