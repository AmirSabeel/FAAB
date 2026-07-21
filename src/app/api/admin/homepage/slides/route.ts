import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

const DEFAULT_SLIDES = [
  {
    title: 'The New\nSeason Arrives',
    subtitle: 'Discover the latest collection of timeless pieces crafted with meticulous attention to detail and refined elegance.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    sortOrder: 0,
    isActive: true,
  },
  {
    title: 'Curated\nLuxury',
    subtitle: "Explore handpicked selections from the world's most coveted fashion houses and emerging designers.",
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    sortOrder: 1,
    isActive: true,
  },
  {
    title: 'Define\nYour Style',
    subtitle: 'From runway to everyday — express your individuality with pieces that speak louder than words.',
    ctaText: 'Discover More',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
    sortOrder: 2,
    isActive: true,
  },
]

async function ensureDefaultSlides() {
  const count = await db.heroSlide.count()
  if (count === 0) {
    for (const slide of DEFAULT_SLIDES) {
      await db.heroSlide.create({ data: slide }).catch(() => {})
    }
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    await ensureDefaultSlides()
    const slides = await db.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(slides)
  } catch (e) {
    console.error('slides GET error:', e)
    return NextResponse.json(DEFAULT_SLIDES)
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
