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

  try {
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
  } catch (err) {
    console.error('Error fetching admin products:', err)
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 1 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const data = {
      name: String(body.name || '').trim(),
      description: body.description ? String(body.description).trim() : null,
      price: Number(body.price) || 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      category: String(body.category || "Women's Fashion"),
      stock: Number(body.stock) || 0,
      image: String(body.image || '').trim(),
      status: String(body.status || 'active'),
      isFeatured: Boolean(body.isFeatured),
      isNew: Boolean(body.isNew),
      isTrending: Boolean(body.isTrending),
      sizes: typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || []),
      colors: typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors || []),
    }

    const product = await db.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error('Error creating product:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = String(body.name).trim()
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null
    if (body.price !== undefined) data.price = Number(body.price)
    if (body.originalPrice !== undefined) data.originalPrice = body.originalPrice ? Number(body.originalPrice) : null
    if (body.category !== undefined) data.category = String(body.category)
    if (body.stock !== undefined) data.stock = Number(body.stock)
    if (body.image !== undefined) data.image = String(body.image).trim()
    if (body.status !== undefined) data.status = String(body.status)
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured)
    if (body.isNew !== undefined) data.isNew = Boolean(body.isNew)
    if (body.isTrending !== undefined) data.isTrending = Boolean(body.isTrending)
    if (body.sizes !== undefined) {
      data.sizes = typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || [])
    }
    if (body.colors !== undefined) {
      data.colors = typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors || [])
    }

    const product = await db.product.update({ where: { id }, data })
    return NextResponse.json(product)
  } catch (err) {
    console.error('Error updating product:', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.orderItem.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}