import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/trending — fetch all trending products ordered by trendingOrder
export async function GET() {
  const products = await db.product.findMany({
    where: { isTrending: true },
    orderBy: { trendingOrder: 'asc' },
  })
  return NextResponse.json(products)
}

// PUT /api/admin/trending — batch update trending list (reorder, add, remove)
// Body: { products: Array<{ id: string; trendingOrder: number }> }
// This replaces the entire trending set
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { products } = body as {
    products: Array<{ id: string; trendingOrder: number }>
  }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: 'products array required' }, { status: 400 })
  }

  // First, remove trending flag from ALL products
  await db.product.updateMany({
    where: { isTrending: true },
    data: { isTrending: false, trendingOrder: 0 },
  })

  // Then set trending flag + order for the provided list
  for (const item of products) {
    await db.product.update({
      where: { id: item.id },
      data: { isTrending: true, trendingOrder: item.trendingOrder },
    })
  }

  // Return updated list
  const updated = await db.product.findMany({
    where: { isTrending: true },
    orderBy: { trendingOrder: 'asc' },
  })
  return NextResponse.json(updated)
}

// PATCH /api/admin/trending — toggle a single product's trending status
// Body: { id: string, isTrending: boolean }
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, isTrending } = body

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // If marking as trending, set order to end of list
  let trendingOrder = 0
  if (isTrending) {
    const maxOrder = await db.product.findFirst({
      where: { isTrending: true },
      orderBy: { trendingOrder: 'desc' },
      select: { trendingOrder: true },
    })
    trendingOrder = (maxOrder?.trendingOrder ?? 0) + 1
  }

  const product = await db.product.update({
    where: { id },
    data: { isTrending, trendingOrder: isTrending ? trendingOrder : 0 },
  })

  return NextResponse.json(product)
}

// DELETE /api/admin/trending?id=xxx — remove a product from trending
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await db.product.update({
    where: { id },
    data: { isTrending: false, trendingOrder: 0 },
  })

  return NextResponse.json({ success: true })
}