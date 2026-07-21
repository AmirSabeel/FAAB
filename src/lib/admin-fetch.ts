/**
 * Shared fetch helper for admin API calls.
 * Automatically attaches the admin secret header.
 */
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'faab-admin-4444'

export function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'x-admin-secret': ADMIN_SECRET,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
}
