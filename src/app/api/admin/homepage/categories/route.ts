import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

const DEFAULT_CATEGORIES = [
  { name: "Women's Fashion", image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&q=80', link: "/shop?category=Women's Fashion", sortOrder: 0 },
  { name: "Men's Fashion", image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=400&fit=crop&q=80', link: "/shop?category=Men's Fashion", sortOrder: 1 },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80', link: '/shop?category=Accessories', sortOrder: 2 },
  { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&q=80', link: '/shop?category=Footwear', sortOrder: 3 },
  { name: 'Bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80', link: '/shop?category=Accessories', sortOrder: 4 },
  { name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&q=80', link: '/shop?category=Watches', sortOrder: 5 },
]

async function ensureDefaultCategories() {
  const count = await db.homepageCategory.count()
  if (count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.homepageCategory.create({ data: cat }).catch(() => {})
    }
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    await ensureDefaultCategories()
    const cats = await db.homepageCategory.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(cats)
  } catch (e) {
    console.error('categories GET error:', e)
    return NextResponse.json(DEFAULT_CATEGORIES)
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const image = String(body.image || '').trim()
    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 })
    }

    const cat = await db.homepageCategory.create({
      data: {
        name,
        image,
        link: body.link ? String(body.link).trim() : '',
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    })
    return NextResponse.json(cat, { status: 201 })
  } catch (e) {
    console.error('categories POST error:', e)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
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
    if (body.image !== undefined) data.image = String(body.image).trim()
    if (body.link !== undefined) data.link = String(body.link).trim()
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder)
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    const cat = await db.homepageCategory.update({ where: { id }, data })
    return NextResponse.json(cat)
  } catch (e) {
    console.error('categories PUT error:', e)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.homepageCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('categories DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
