import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const cats = await db.homepageCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(cats)
}