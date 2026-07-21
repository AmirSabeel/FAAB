import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const products = await db.product.findMany({
      where: { isTrending: true },
      orderBy: { trendingOrder: 'asc' },
    })
    return NextResponse.json(products)
  } catch (err) {
    console.error('Error fetching trending products:', err)
    return NextResponse.json([])
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const { products } = body as { products: Array<{ id: string; trendingOrder: number }> }

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'products array required' }, { status: 400 })
    }

    for (const item of products) {
      if (item.id) {
        await db.product.update({
          where: { id: item.id },
          data: { isTrending: true, trendingOrder: Number(item.trendingOrder) || 0 },
        })
      }
    }

    const updated = await db.product.findMany({
      where: { isTrending: true },
      orderBy: { trendingOrder: 'asc' },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Error reordering trending products:', err)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
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
      data: { isTrending: Boolean(isTrending), trendingOrder: isTrending ? trendingOrder : 0 },
    })

    return NextResponse.json(product)
  } catch (err) {
    console.error('Error updating trending status:', err)
    return NextResponse.json({ error: 'Failed to update trending' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.product.update({
      where: { id },
      data: { isTrending: false, trendingOrder: 0 },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error removing from trending:', err)
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
  }
}