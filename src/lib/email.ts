import nodemailer from 'nodemailer'

// ── Transporter (lazy init, only created when needed) ────────────────────────

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  // If no SMTP config, email is disabled
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  return transporter
}

// ── Public API ────────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Send an email. Silently no-ops if SMTP is not configured.
 * Returns true if sent, false if disabled or failed.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const transport = getTransporter()
  if (!transport) {
    console.log('[Email] SMTP not configured — skipping email to', to)
    return false
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'FAAB Store <noreply@faab.store>',
      to,
      subject,
      html,
    })
    console.log('[Email] Sent to', to, '| Subject:', subject)
    return true
  } catch (err) {
    console.error('[Email] Failed to send to', to, err)
    return false
  }
}

/**
 * Check if email sending is configured.
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS)
}