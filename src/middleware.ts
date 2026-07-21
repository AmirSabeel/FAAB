import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require admin role
const ADMIN_API_PATTERN = '/api/admin'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /api/admin/* routes
  if (!pathname.startsWith(ADMIN_API_PATTERN)) {
    return NextResponse.next()
  }

  // Get JWT token — uses NEXTAUTH_SECRET for verification
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // No token = not authenticated
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Token exists but role is not admin
  if (token.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  return NextResponse.next()
}

// Only run on admin API routes
export const config = {
  matcher: '/api/admin/:path*',
}