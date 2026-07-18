import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const cols = await db.homepageCollection.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(cols)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, image, itemCount, link, sortOrder, isActive } = body
  if (!name || !image) {
    return NextResponse.json({ error: 'Name and image are required' }, { status: 400 })
  }
  const col = await db.homepageCollection.create({
    data: { name, image, itemCount: itemCount ?? 0, link: link || '/shop', sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
  })
  return NextResponse.json(col, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const col = await db.homepageCollection.update({ where: { id }, data })
  return NextResponse.json(col)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.homepageCollection.delete({ where: { id } })
  return NextResponse.json({ success: true })
}