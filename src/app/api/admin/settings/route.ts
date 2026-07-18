import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Default settings definition
const DEFAULT_SETTINGS: Array<{ key: string; value: string; group: string; label: string; type: string; order: number }> = [
  // General
  { key: 'store_name', value: 'FAAB', group: 'general', label: 'Store Name', type: 'text', order: 0 },
  { key: 'store_tagline', value: 'Luxury Redefined', group: 'general', label: 'Store Tagline', type: 'text', order: 1 },
  { key: 'store_email', value: 'hello@faab.in', group: 'general', label: 'Contact Email', type: 'text', order: 2 },
  { key: 'store_phone', value: '+91 98765 43210', group: 'general', label: 'Contact Phone', type: 'text', order: 3 },
  { key: 'store_address', value: 'Mumbai, Maharashtra, India', group: 'general', label: 'Store Address', type: 'textarea', order: 4 },
  { key: 'store_currency', value: 'INR', group: 'general', label: 'Currency', type: 'select', order: 5 },
  { key: 'store_currency_symbol', value: '₹', group: 'general', label: 'Currency Symbol', type: 'text', order: 6 },

  // Tax & Shipping
  { key: 'tax_rate', value: '18', group: 'tax_shipping', label: 'Tax Rate (%)', type: 'number', order: 0 },
  { key: 'tax_enabled', value: 'true', group: 'tax_shipping', label: 'Enable Tax', type: 'toggle', order: 1 },
  { key: 'shipping_flat_rate', value: '149', group: 'tax_shipping', label: 'Flat Shipping Rate (₹)', type: 'number', order: 2 },
  { key: 'free_shipping_threshold', value: '2999', group: 'tax_shipping', label: 'Free Shipping Above (₹)', type: 'number', order: 3 },
  { key: 'free_shipping_enabled', value: 'true', group: 'tax_shipping', label: 'Enable Free Shipping Threshold', type: 'toggle', order: 4 },

  // Social Media
  { key: 'social_instagram', value: 'https://instagram.com/faab', group: 'social', label: 'Instagram URL', type: 'text', order: 0 },
  { key: 'social_facebook', value: 'https://facebook.com/faab', group: 'social', label: 'Facebook URL', type: 'text', order: 1 },
  { key: 'social_twitter', value: 'https://twitter.com/faab', group: 'social', label: 'Twitter / X URL', type: 'text', order: 2 },
  { key: 'social_youtube', value: 'https://youtube.com/@faab', group: 'social', label: 'YouTube URL', type: 'text', order: 3 },
  { key: 'social_pinterest', value: '', group: 'social', label: 'Pinterest URL', type: 'text', order: 4 },

  // Notifications
  { key: 'notify_new_order', value: 'true', group: 'notifications', label: 'New Order Notifications', type: 'toggle', order: 0 },
  { key: 'notify_low_stock', value: 'true', group: 'notifications', label: 'Low Stock Alerts', type: 'toggle', order: 1 },
  { key: 'low_stock_threshold', value: '5', group: 'notifications', label: 'Low Stock Threshold', type: 'number', order: 2 },
  { key: 'notify_customer_review', value: 'true', group: 'notifications', label: 'Customer Review Notifications', type: 'toggle', order: 3 },
]

// Ensure all default settings exist
async function ensureDefaults() {
  for (const def of DEFAULT_SETTINGS) {
    await db.siteSetting.upsert({
      where: { key: def.key },
      update: {},
      create: def,
    })
  }
}

export async function GET() {
  try {
    await ensureDefaults()
    const settings = await db.siteSetting.findMany({
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
    })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { settings } = body as { settings: Array<{ key: string; value: string }> }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'settings array required' }, { status: 400 })
    }

    const results = await Promise.all(
      settings.map((s) =>
        db.siteSetting.update({
          where: { key: s.key },
          data: { value: s.value },
        })
      )
    )

    return NextResponse.json({ success: true, updated: results.length })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}