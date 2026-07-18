import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
    images: [product.image], // single image in DB; extend later for gallery
    category: product.category,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    // Detail page extras (not in DB yet — defaults)
    sizes: [] as string[],
    colors: [] as { name: string; hex: string }[],
  })
}