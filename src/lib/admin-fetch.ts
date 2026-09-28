/**
 * Shared fetch helper for admin API calls.
 * Automatically attaches the admin secret header.
 */
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'faab-admin-4444'

export function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const hasContentType = init?.headers && (
    (typeof Headers !== 'undefined' && init.headers instanceof Headers && init.headers.has('content-type')) ||
    (typeof init.headers === 'object' && Object.keys(init.headers).some(k => k.toLowerCase() === 'content-type'))
  )

  const defaultHeaders: Record<string, string> = {
    'x-admin-secret': ADMIN_SECRET,
  }

  if (init?.body && !isFormData && !hasContentType) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  return fetch(input, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers || {}),
    },
  })
}
