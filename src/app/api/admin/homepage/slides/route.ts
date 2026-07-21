import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const slides = await db.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(slides)
  } catch (e) {
    console.error('slides GET error:', e)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const title = String(body.title || '').trim()
    const image = String(body.image || '').trim()
    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }

    const slide = await db.heroSlide.create({
      data: {
        title,
        subtitle: body.subtitle ? String(body.subtitle).trim() : '',
        ctaText: body.ctaText ? String(body.ctaText).trim() : 'Shop Now',
        ctaLink: body.ctaLink ? String(body.ctaLink).trim() : '/shop',
        image,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    })
    return NextResponse.json(slide, { status: 201 })
  } catch (e) {
    console.error('slides POST error:', e)
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 })
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
    if (body.title !== undefined) data.title = String(body.title).trim()
    if (body.subtitle !== undefined) data.subtitle = String(body.subtitle).trim()
    if (body.ctaText !== undefined) data.ctaText = String(body.ctaText).trim()
    if (body.ctaLink !== undefined) data.ctaLink = String(body.ctaLink).trim()
    if (body.image !== undefined) data.image = String(body.image).trim()
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder)
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    const slide = await db.heroSlide.update({ where: { id }, data })
    return NextResponse.json(slide)
  } catch (e) {
    console.error('slides PUT error:', e)
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.heroSlide.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('slides DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 })
  }
}
