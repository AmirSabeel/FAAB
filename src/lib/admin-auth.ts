import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'faab-admin-4444'

/**
 * Protect admin API routes — validates the x-admin-secret header.
 */
export async function requireAdmin(request?: Request) {
  // If no request provided, allow (server-side internal calls)
  if (!request) return { error: null }

  const secret = request.headers.get('x-admin-secret')
  if (secret !== ADMIN_SECRET) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { error: null }
}
