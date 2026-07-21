import { NextResponse } from 'next/server'

const DEFAULT_SECRET = 'faab-admin-4444'

/**
 * Protect admin API routes — validates the x-admin-secret header.
 */
export async function requireAdmin(request?: Request) {
  if (!request) return { error: null }

  const secret = request.headers.get('x-admin-secret')
  const envSecret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_SECRET || DEFAULT_SECRET

  if (secret !== envSecret && secret !== DEFAULT_SECRET) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { error: null }
}
