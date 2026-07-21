import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const products = await db.product.findMany({
    where: { isTrending: true },
    orderBy: { trendingOrder: 'asc' },
  })
  return NextResponse.json(products)
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const body = await req.json()
  const { products } = body as { products: Array<{ id: string; trendingOrder: number }> }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: 'products array required' }, { status: 400 })
  }

  await db.product.updateMany({
    where: { isTrending: true },
    data: { isTrending: false, trendingOrder: 0 },
  })

  for (const item of products) {
    await db.product.update({
      where: { id: item.id },
      data: { isTrending: true, trendingOrder: item.trendingOrder },
    })
  }

  const updated = await db.product.findMany({
    where: { isTrending: true },
    orderBy: { trendingOrder: 'asc' },
  })
  return NextResponse.json(updated)
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const body = await req.json()
  const { id, isTrending } = body

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

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

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await db.product.update({
    where: { id },
    data: { isTrending: false, trendingOrder: 0 },
  })

  return NextResponse.json({ success: true })
}