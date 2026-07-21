import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const categories = await db.homepageCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => [])

  return NextResponse.json(categories, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  })
}