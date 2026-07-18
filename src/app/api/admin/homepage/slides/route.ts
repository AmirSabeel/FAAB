import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const slides = await db.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(slides)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, subtitle, ctaText, ctaLink, image, sortOrder, isActive } = body
  if (!title || !image) {
    return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
  }
  const slide = await db.heroSlide.create({
    data: { title, subtitle: subtitle || '', ctaText: ctaText || 'Shop Now', ctaLink: ctaLink || '/shop', image, sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
  })
  return NextResponse.json(slide, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const slide = await db.heroSlide.update({ where: { id }, data })
  return NextResponse.json(slide)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await db.heroSlide.delete({ where: { id } })
  return NextResponse.json({ success: true })
}