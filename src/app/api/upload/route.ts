import { NextRequest, NextResponse } from 'next/server'
import { mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const SIZES: Record<string, { width: number; height: number }> = {
  thumb:  { width: 100, height: 133 },
  small:  { width: 300, height: 400 },
  medium: { width: 500, height: 667 },
  large:  { width: 800, height: 1067 },
}

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads', 'products')

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, WebP, GIF, or AVIF.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const prefix = `${Date.now()}-${crypto.randomBytes(3).toString('hex').slice(0, 6)}`

    try {
      // Attempt local disk save
      await Promise.all(
        ['thumb', 'small', 'medium', 'large', 'original'].map((dir) =>
          mkdir(path.join(UPLOAD_BASE, dir), { recursive: true })
        )
      )

      const originalName = `${prefix}-original.webp`
      const originalPath = path.join(UPLOAD_BASE, 'original', originalName)
      await sharp(buffer).webp({ quality: 85 }).toFile(originalPath)
      const originalMeta = await sharp(originalPath).metadata()

      const sizes: Record<string, { url: string; width: number; height: number; size: string }> = {
        original: {
          url: `/uploads/products/original/${originalName}`,
          width: originalMeta.width || 0,
          height: originalMeta.height || 0,
          size: formatBytes(originalMeta.size || 0),
        },
      }

      for (const [name, dims] of Object.entries(SIZES)) {
        const fileName = `${prefix}-${name}.webp`
        const filePath = path.join(UPLOAD_BASE, name, fileName)
        await sharp(buffer)
          .resize(dims.width, dims.height, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(filePath)
        const stat = await sharp(filePath).metadata()
        sizes[name] = {
          url: `/uploads/products/${name}/${fileName}`,
          width: dims.width,
          height: dims.height,
          size: formatBytes(stat.size || 0),
        }
      }

      return NextResponse.json({
        success: true,
        fileName: `${prefix}-medium.webp`,
        sizes,
        mainUrl: sizes.medium.url,
      })
    } catch (fsErr) {
      // Fallback for serverless environments (e.g. Vercel read-only filesystem)
      console.warn('Local FS write unavailable, returning Data URL fallback:', fsErr)
      const resizedBuffer = await sharp(buffer)
        .resize(500, 667, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer()
      const dataUrl = `data:image/webp;base64,${resizedBuffer.toString('base64')}`

      return NextResponse.json({
        success: true,
        fileName: `${prefix}-medium.webp`,
        sizes: {
          medium: {
            url: dataUrl,
            width: 500,
            height: 667,
            size: formatBytes(resizedBuffer.length),
          },
        },
        mainUrl: dataUrl,
      })
    }
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    )
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
