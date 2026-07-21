import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Protect admin API routes — requires authenticated user with role "admin".
 * Call at the top of every admin route handler.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), session: null }
  }

  const role = (session.user as Record<string, unknown>).role
  if (role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }), session: null }
  }

  return { error: null, session }
}