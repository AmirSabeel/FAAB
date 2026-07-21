import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { ALL_PRODUCTS } from '@/data/products'

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

  let product = await db.product.findUnique({
    where: { id },
  }).catch(() => null)

  const fallbackMatch = ALL_PRODUCTS.find((p) => p.id === id)

  if (!product && fallbackMatch) {
    product = await db.product.findFirst({
      where: { name: fallbackMatch.name },
    }).catch(() => null)
  }

  if (!product && fallbackMatch) {
    return NextResponse.json({
      id: fallbackMatch.id,
      name: fallbackMatch.name,
      description: fallbackMatch.description || '',
      price: fallbackMatch.price,
      originalPrice: fallbackMatch.originalPrice || null,
      image: fallbackMatch.image,
      images: fallbackMatch.images || [fallbackMatch.image],
      category: fallbackMatch.category,
      rating: fallbackMatch.rating || 4.8,
      reviewCount: fallbackMatch.reviewCount || 10,
      stock: 25,
      isNew: fallbackMatch.isNew || false,
      isFeatured: true,
      sizes: fallbackMatch.sizes || [],
      colors: fallbackMatch.colors || [],
    })
  }

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