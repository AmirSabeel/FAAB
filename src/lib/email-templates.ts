import { formatPrice } from './email-utils'

interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: { name: string; price: number; quantity: number; size?: string; color?: string }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  address?: string
  city?: string
  country?: string
}

export function orderConfirmationEmail(data: OrderConfirmationData): string {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
        ${item.name}${item.size ? ` — Size: ${item.size}` : ''}${item.color ? ` — Color: ${item.color}` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join('')

  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a;">
    <!-- Header -->
    <div style="text-align: center; padding: 40px 0 24px;">
      <h1 style="font-size: 28px; font-weight: 700; letter-spacing: 3px; margin: 0; color: #1a1a1a;">FAAB</h1>
      <p style="font-size: 13px; color: #888; margin-top: 4px; letter-spacing: 1px;">LUXURY FASHION</p>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: 0 0 32px;"></div>

    <!-- Confirmation Message -->
    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Order Confirmed</h2>
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      Thank you for your order, <strong>${data.customerName}</strong>! We've received your order and will notify you when it ships.
    </p>

    <!-- Order Info -->
    <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="color: #888; padding: 4px 0;">Order Number</td>
          <td style="text-align: right; font-weight: 600;">${data.orderNumber}</td>
        </tr>
        ${data.address ? `<tr>
          <td style="color: #888; padding: 4px 0;">Shipping To</td>
          <td style="text-align: right;">${data.address}${data.city ? `, ${data.city}` : ''}${data.country ? `, ${data.country}` : ''}</td>
        </tr>` : ''}
        <tr>
          <td style="color: #888; padding: 4px 0;">Date</td>
          <td style="text-align: right;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #1a1a1a;">
          <th style="text-align: left; padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888;">Product</th>
          <th style="text-align: center; padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888;">Qty</th>
          <th style="text-align: right; padding: 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <div style="border-top: 2px solid #1a1a1a; padding-top: 16px;">
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="color: #888; padding: 4px 0;">Subtotal</td>
          <td style="text-align: right;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="color: #888; padding: 4px 0;">Shipping</td>
          <td style="text-align: right;">${data.shipping === 0 ? 'Free' : formatPrice(data.shipping)}</td>
        </tr>
        ${data.tax > 0 ? `<tr>
          <td style="color: #888; padding: 4px 0;">Tax (GST 18%)</td>
          <td style="text-align: right;">${formatPrice(data.tax)}</td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #1a1a1a;">
          <td style="font-weight: 700; font-size: 16px; padding: 12px 0 0;">Total</td>
          <td style="text-align: right; font-weight: 700; font-size: 16px; padding: 12px 0 0; color: #c9a96e;">${formatPrice(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: 32px 0;"></div>

    <!-- Footer -->
    <p style="text-align: center; color: #888; font-size: 12px; line-height: 1.6; margin: 0;">
      If you have any questions, reply to this email or contact us at support@faab.store.<br>
      FAAB Luxury Fashion &mdash; Curated for you.
    </p>
  </div>`
}

interface OrderStatusData {
  orderNumber: string
  customerName: string
  newStatus: string
}

export function orderStatusUpdateEmail(data: OrderStatusData): string {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    processing: 'Your order is now being processed and will ship soon.',
    shipped: 'Your order has shipped! You will receive tracking details shortly.',
    delivered: 'Your order has been delivered. We hope you love your purchase!',
    cancelled: 'Your order has been cancelled. A refund will be processed if applicable.',
  }

  const message = statusMessages[data.newStatus] || `Your order status has been updated to "${data.newStatus}".`

  return `
  <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a;">
    <div style="text-align: center; padding: 40px 0 24px;">
      <h1 style="font-size: 28px; font-weight: 700; letter-spacing: 3px; margin: 0;">FAAB</h1>
      <p style="font-size: 13px; color: #888; margin-top: 4px; letter-spacing: 1px;">LUXURY FASHION</p>
    </div>
    <div style="height: 1px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: 0 0 32px;"></div>

    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Order Update</h2>
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      Hi <strong>${data.customerName}</strong>,<br>${message}
    </p>

    <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="font-size: 13px; color: #888; margin: 0 0 4px;">Order Number</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0;">${data.orderNumber}</p>
    </div>

    <div style="height: 1px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: 32px 0;"></div>
    <p style="text-align: center; color: #888; font-size: 12px;">FAAB Luxury Fashion</p>
  </div>`
}