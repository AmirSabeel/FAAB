import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  try {
    const cats = await db.homepageCategory.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(cats)
  } catch (e) {
    console.error('categories GET error:', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  try {
    const body = await req.json()
    const { name, image, link, sortOrder, isActive } = body
    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image are required' }, { status: 400 })
    }
    const cat = await db.homepageCategory.create({
      data: { name, image, link: link || '', sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
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
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
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
