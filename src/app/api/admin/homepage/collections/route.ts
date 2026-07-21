import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const DEFAULT_COLLECTIONS = [
  { name: 'Summer Essentials', itemCount: 12, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop&q=80', link: '/shop', sortOrder: 0 },
  { name: 'Evening Wear', itemCount: 8, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&q=80', link: '/shop', sortOrder: 1 },
  { name: 'Minimal Edit', itemCount: 15, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop&q=80', link: '/shop', sortOrder: 2 },
]

async function ensureDefaultCollections() {
  const count = await db.homepageCollection.count()
  if (count === 0) {
    for (const col of DEFAULT_COLLECTIONS) {
      await db.homepageCollection.create({ data: col }).catch(() => {})
    }
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    await ensureDefaultCollections()
    const cols = await db.homepageCollection.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(cols)
  } catch (e) {
    console.error('collections GET error:', e)
    return NextResponse.json(DEFAULT_COLLECTIONS)
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

    const col = await db.homepageCollection.create({
      data: {
        name,
        image,
        itemCount: Number(body.itemCount) || 0,
        link: body.link ? String(body.link).trim() : '/shop',
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    })
    return NextResponse.json(col, { status: 201 })
  } catch (e) {
    console.error('collections POST error:', e)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
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
    if (body.itemCount !== undefined) data.itemCount = Number(body.itemCount)
    if (body.link !== undefined) data.link = String(body.link).trim()
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder)
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    const col = await db.homepageCollection.update({ where: { id }, data })
    return NextResponse.json(col)
  } catch (e) {
    console.error('collections PUT error:', e)
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.homepageCollection.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('collections DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}

