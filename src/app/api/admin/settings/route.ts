import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

const DEFAULT_SETTINGS: Array<{ key: string; value: string; group: string; label: string; type: string; order: number }> = [
  { key: 'store_name', value: 'FAAB', group: 'general', label: 'Store Name', type: 'text', order: 0 },
  { key: 'store_tagline', value: 'Luxury Redefined', group: 'general', label: 'Store Tagline', type: 'text', order: 1 },
  { key: 'store_email', value: 'hello@faab.in', group: 'general', label: 'Contact Email', type: 'text', order: 2 },
  { key: 'store_phone', value: '+91 98765 43210', group: 'general', label: 'Contact Phone', type: 'text', order: 3 },
  { key: 'store_address', value: 'Mumbai, Maharashtra, India', group: 'general', label: 'Store Address', type: 'textarea', order: 4 },
  { key: 'store_currency', value: 'INR', group: 'general', label: 'Currency', type: 'select', order: 5 },
  { key: 'store_currency_symbol', value: '₹', group: 'general', label: 'Currency Symbol', type: 'text', order: 6 },
  { key: 'tax_rate', value: '18', group: 'tax_shipping', label: 'Tax Rate (%)', type: 'number', order: 0 },
  { key: 'tax_enabled', value: 'true', group: 'tax_shipping', label: 'Enable Tax', type: 'toggle', order: 1 },
  { key: 'shipping_flat_rate', value: '149', group: 'tax_shipping', label: 'Flat Shipping Rate (₹)', type: 'number', order: 2 },
  { key: 'free_shipping_threshold', value: '2999', group: 'tax_shipping', label: 'Free Shipping Above (₹)', type: 'number', order: 3 },
  { key: 'free_shipping_enabled', value: 'true', group: 'tax_shipping', label: 'Enable Free Shipping Threshold', type: 'toggle', order: 4 },
  { key: 'social_instagram', value: 'https://instagram.com/faab', group: 'social', label: 'Instagram URL', type: 'text', order: 0 },
  { key: 'social_facebook', value: 'https://facebook.com/faab', group: 'social', label: 'Facebook URL', type: 'text', order: 1 },
  { key: 'social_twitter', value: 'https://twitter.com/faab', group: 'social', label: 'Twitter / X URL', type: 'text', order: 2 },
  { key: 'social_youtube', value: 'https://youtube.com/@faab', group: 'social', label: 'YouTube URL', type: 'text', order: 3 },
  { key: 'social_pinterest', value: '', group: 'social', label: 'Pinterest URL', type: 'text', order: 4 },
  { key: 'notify_new_order', value: 'true', group: 'notifications', label: 'New Order Notifications', type: 'toggle', order: 0 },
  { key: 'notify_low_stock', value: 'true', group: 'notifications', label: 'Low Stock Alerts', type: 'toggle', order: 1 },
  { key: 'low_stock_threshold', value: '5', group: 'notifications', label: 'Low Stock Threshold', type: 'number', order: 2 },
  { key: 'notify_customer_review', value: 'true', group: 'notifications', label: 'Customer Review Notifications', type: 'toggle', order: 3 },
]

async function ensureDefaults() {
  const existing = await db.siteSetting.findMany({ select: { key: true } })
  const existingKeys = new Set(existing.map((s) => s.key))

  const missing = DEFAULT_SETTINGS.filter((def) => !existingKeys.has(def.key))
  if (missing.length > 0) {
    for (const def of missing) {
      await db.siteSetting.create({ data: def }).catch(() => {})
    }
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    await ensureDefaults()
    const settings = await db.siteSetting.findMany({
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
    })
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('Settings GET error:', err)
    return NextResponse.json({ settings: DEFAULT_SETTINGS }, { status: 200 })
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const body = await req.json()
    const { settings } = body as { settings: Array<{ key: string; value: string }> }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'settings array required' }, { status: 400 })
    }

    const results = await Promise.all(
      settings.map((s) =>
        db.siteSetting.upsert({
          where: { key: s.key },
          update: { value: String(s.value) },
          create: {
            key: s.key,
            value: String(s.value),
            group: 'general',
            label: s.key,
            type: 'text',
            order: 0,
          },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (err) {
    console.error('Settings PUT error:', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
