import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  try {
    const cols = await db.homepageCollection.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(cols)
  } catch (e) {
    console.error('collections GET error:', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  try {
    const body = await req.json()
    const { name, image, itemCount, link, sortOrder, isActive } = body
    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 })
    }
    const col = await db.homepageCollection.create({
      data: { name, image, itemCount: itemCount ?? 0, link: link || '/shop', sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
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
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
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
