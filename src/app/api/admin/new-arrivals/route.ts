import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/new-arrivals — fetch all new arrival products ordered by newArrivalOrder
export async function GET() {
  const products = await db.product.findMany({
    where: { newArrivalOrder: { gt: 0 } },
    orderBy: { newArrivalOrder: 'asc' },
  })
  return NextResponse.json(products)
}

// PUT /api/admin/new-arrivals — batch update new arrivals list (reorder, add, remove)
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { products } = body as {
    products: Array<{ id: string; newArrivalOrder: number }>
  }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: 'products array required' }, { status: 400 })
  }

  // Remove newArrival flag from ALL products
  await db.product.updateMany({
    where: { newArrivalOrder: { gt: 0 } },
    data: { newArrivalOrder: 0, isNew: false },
  })

  // Set newArrival flag + order for the provided list
  for (const item of products) {
    await db.product.update({
      where: { id: item.id },
      data: { newArrivalOrder: item.newArrivalOrder, isNew: true },
    })
  }

  const updated = await db.product.findMany({
    where: { newArrivalOrder: { gt: 0 } },
    orderBy: { newArrivalOrder: 'asc' },
  })
  return NextResponse.json(updated)
}

// PATCH /api/admin/new-arrivals — toggle a single product's new arrival status
export async function PATCH(req: NextRequest) {
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
    data: { newArrivalOrder: isNewArrival ? newArrivalOrder : 0, isNew: isNewArrival },
  })

  return NextResponse.json(product)
}

// DELETE /api/admin/new-arrivals?id=xxx — remove a product from new arrivals
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await db.product.update({
    where: { id },
    data: { newArrivalOrder: 0, isNew: false },
  })

  return NextResponse.json({ success: true })
}