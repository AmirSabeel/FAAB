import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (search) where.name = { contains: search }
  if (category) where.category = category
  if (status) where.status = status

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const body = await req.json()
  // Ensure sizes/colors are stored as JSON strings
  const data = {
    ...body,
    sizes: typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || []),
    colors: typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors || []),
  }
  const product = await db.product.create({ data })
  return NextResponse.json(product, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const body = await req.json()
  const { id, sizes, colors, ...rest } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const data = {
    ...rest,
    sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes || []),
    colors: typeof colors === 'string' ? colors : JSON.stringify(colors || []),
  }
  const product = await db.product.update({ where: { id }, data })
  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.orderItem.deleteMany({ where: { productId: id } })
  await db.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}