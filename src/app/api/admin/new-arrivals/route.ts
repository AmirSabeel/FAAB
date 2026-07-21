import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const products = await db.product.findMany({
      where: { newArrivalOrder: { gt: 0 } },
      orderBy: { newArrivalOrder: 'asc' },
    })
    return NextResponse.json(products)
  } catch (err) {
    console.error('Error fetching new arrivals:', err)
    return NextResponse.json([])
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const { products } = body as { products: Array<{ id: string; newArrivalOrder: number }> }

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'products array required' }, { status: 400 })
    }

    for (const item of products) {
      if (item.id) {
        await db.product.update({
          where: { id: item.id },
          data: { newArrivalOrder: Number(item.newArrivalOrder) || 0, isNew: true },
        })
      }
    }

    const updated = await db.product.findMany({
      where: { newArrivalOrder: { gt: 0 } },
      orderBy: { newArrivalOrder: 'asc' },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Error updating new arrivals order:', err)
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const { id, isNewArrival } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    let newArrivalOrder = 0
    if (isNewArrival) {
      const maxOrder = await db.product.findFirst({
        where: { newArrivalOrder: { gt: 0 } },
        orderBy: { newArrivalOrder: 'desc' },
        select: { newArrivalOrder: true },
      })
      newArrivalOrder = (maxOrder?.newArrivalOrder ?? 0) + 1
    }

    const product = await db.product.update({
      where: { id },
      data: { newArrivalOrder: isNewArrival ? newArrivalOrder : 0, isNew: Boolean(isNewArrival) },
    })

    return NextResponse.json(product)
  } catch (err) {
    console.error('Error toggling new arrival:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
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
      data: { newArrivalOrder: 0, isNew: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error removing new arrival:', err)
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
  }
}
