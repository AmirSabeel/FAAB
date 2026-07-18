import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const cols = await db.homepageCollection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(cols)
}