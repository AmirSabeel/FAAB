import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { ALL_PRODUCTS } from '@/data/products'

async function ensureDefaultProducts() {
  const count = await db.product.count()
  if (count < ALL_PRODUCTS.length) {
    for (let i = 0; i < ALL_PRODUCTS.length; i++) {
      const p = ALL_PRODUCTS[i]
      const existing = await db.product.findFirst({ where: { name: p.name } })
      if (!existing) {
        await db.product.create({
          data: {
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice || null,
            image: p.image,
            category: p.category,
            rating: p.rating || 4.8,
            reviewCount: p.reviewCount || 10,
            stock: 25,
            status: 'active',
            isFeatured: true,
            isNew: p.isNew || false,
            isTrending: p.id.startsWith('trend-'),
            trendingOrder: p.id.startsWith('trend-') ? i + 1 : 0,
            newArrivalOrder: p.id.startsWith('new-') ? i + 1 : 0,
            sizes: JSON.stringify(p.sizes || []),
            colors: JSON.stringify(p.colors || []),
          },
        }).catch(() => {})
      }
    }
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: Record<string, unknown> = {}
  if (category && category !== 'all' && category !== 'All') where.category = category
  if (search) where.name = { contains: search }

  try {
    await ensureDefaultProducts()
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
    const name = String(body.name || '').trim()
    const category = String(body.category || '').trim()
    const price = Number(body.price) || 0
    const image = String(body.image || '').trim()

    if (!name || !category || !price || !image) {
      return NextResponse.json({ error: 'Name, category, price, and image are required' }, { status: 400 })
    }

    const sizes = Array.isArray(body.sizes) ? JSON.stringify(body.sizes) : typeof body.sizes === 'string' ? body.sizes : '[]'
    const colors = Array.isArray(body.colors) ? JSON.stringify(body.colors) : typeof body.colors === 'string' ? body.colors : '[]'

    const product = await db.product.create({
      data: {
        name,
        description: body.description ? String(body.description).trim() : '',
        price,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        category,
        stock: Number(body.stock) || 0,
        status: body.status || 'active',
        image,
        sizes,
        colors,
        isFeatured: Boolean(body.isFeatured),
        isNew: Boolean(body.isNew),
        isTrending: Boolean(body.isTrending),
      },
    })

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

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = String(body.name).trim()
    if (body.description !== undefined) updateData.description = String(body.description).trim()
    if (body.price !== undefined) updateData.price = Number(body.price)
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? Number(body.originalPrice) : null
    if (body.category !== undefined) updateData.category = String(body.category).trim()
    if (body.stock !== undefined) updateData.stock = Number(body.stock)
    if (body.status !== undefined) updateData.status = String(body.status)
    if (body.image !== undefined) updateData.image = String(body.image).trim()
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured)
    if (body.isNew !== undefined) updateData.isNew = Boolean(body.isNew)
    if (body.isTrending !== undefined) updateData.isTrending = Boolean(body.isTrending)

    if (body.sizes !== undefined) {
      updateData.sizes = Array.isArray(body.sizes) ? JSON.stringify(body.sizes) : typeof body.sizes === 'string' ? body.sizes : '[]'
    }
    if (body.colors !== undefined) {
      updateData.colors = Array.isArray(body.colors) ? JSON.stringify(body.colors) : typeof body.colors === 'string' ? body.colors : '[]'
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
    })

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

    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}