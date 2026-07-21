import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { ALL_PRODUCTS } from '@/data/products'

const FALLBACK_ADMIN_PRODUCTS = ALL_PRODUCTS.map((p, i) => ({
  id: p.id || `prod-${i + 1}`,
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
  createdAt: new Date().toISOString(),
  sizes: JSON.stringify(p.sizes || []),
  colors: JSON.stringify(p.colors || []),
}))

async function ensureDefaultProducts() {
  try {
    const count = await db.product.count()
    if (count === 0) {
      for (let i = 0; i < ALL_PRODUCTS.length; i++) {
        const p = ALL_PRODUCTS[i]
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
  } catch {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get('search') || '').toLowerCase().trim()
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    await ensureDefaultProducts()

    // 1. Fetch all DB products
    const dbProducts = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    // 2. Map existing DB products by name and id
    const dbMapByName = new Map(dbProducts.map((p) => [p.name.toLowerCase().trim(), p]))
    const dbMapById = new Map(dbProducts.map((p) => [p.id, p]))

    // 3. Build merged list
    const mergedList: Array<any> = []
    const processedDbIds = new Set<string>()

    for (const fallback of FALLBACK_ADMIN_PRODUCTS) {
      const match = dbMapByName.get(fallback.name.toLowerCase().trim()) || dbMapById.get(fallback.id)
      if (match) {
        mergedList.push(match)
        processedDbIds.add(match.id)
      } else {
        mergedList.push(fallback)
      }
    }

    for (const dbP of dbProducts) {
      if (!processedDbIds.has(dbP.id)) {
        mergedList.push(dbP)
      }
    }

    // 4. Apply category & search filters
    let filtered = mergedList
    if (category && category !== 'all' && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category)
    }
    if (search) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search))
    }

    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      products: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    })
  } catch (err) {
    console.error('Error fetching admin products:', err)
    let filtered = FALLBACK_ADMIN_PRODUCTS
    if (category && category !== 'all' && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category)
    }
    if (search) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search))
    }
    return NextResponse.json({
      products: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    })
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
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice !== null && body.originalPrice !== '' ? Number(body.originalPrice) : null
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

    let existingProduct = await db.product.findUnique({ where: { id } }).catch(() => null)
    if (!existingProduct && updateData.name) {
      existingProduct = await db.product.findFirst({ where: { name: String(updateData.name) } }).catch(() => null)
    }

    let product
    if (existingProduct) {
      product = await db.product.update({
        where: { id: existingProduct.id },
        data: updateData,
      })
    } else {
      product = await db.product.create({
        data: {
          name: String(updateData.name || 'Product'),
          description: String(updateData.description || ''),
          price: Number(updateData.price) || 0,
          originalPrice: updateData.originalPrice !== null && updateData.originalPrice !== undefined ? Number(updateData.originalPrice) : null,
          category: String(updateData.category || "Women's Fashion"),
          stock: Number(updateData.stock) || 25,
          image: String(updateData.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=667&fit=crop&q=80'),
          status: String(updateData.status || 'active'),
          sizes: String(updateData.sizes || '[]'),
          colors: String(updateData.colors || '[]'),
          isFeatured: Boolean(updateData.isFeatured),
          isNew: Boolean(updateData.isNew),
        },
      })
    }

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

    const existingProduct = await db.product.findUnique({ where: { id } }).catch(() => null)
    if (existingProduct) {
      await db.product.delete({ where: { id: existingProduct.id } }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting product:', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}