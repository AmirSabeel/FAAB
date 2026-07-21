import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const slides = await db.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(slides)
}