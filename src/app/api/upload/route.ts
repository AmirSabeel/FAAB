import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Size configurations: name → { width, height (0 = auto), suffix }
const SIZES: Record<string, { width: number; height: number; suffix: string }> = {
  thumb:  { width: 100,  height: 133,  suffix: 'thumb' },
  small:  { width: 300,  height: 400,  suffix: 'small' },
  medium: { width: 500,  height: 667,  suffix: 'medium' },
  large:  { width: 800,  height: 1067, suffix: 'large' },
  original: { width: 0, height: 0, suffix: 'original' },
}

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads', 'products')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, GIF, AVIF` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const uniqueId = crypto.randomBytes(8).toString('hex')
    const baseName = `${uniqueId}-${Date.now()}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Ensure directories exist
    for (const sizeName of Object.keys(SIZES)) {
      const dir = path.join(UPLOAD_BASE, sizeName)
      if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    }

    const results: Record<string, { url: string; width: number; height: number; size: string }> = {}

    // Process each size
    for (const [sizeName, config] of Object.entries(SIZES)) {
      const fileName = `${baseName}-${config.suffix}.webp`
      const filePath = path.join(UPLOAD_BASE, sizeName, fileName)

      let processedBuffer: Buffer

      if (config.width === 0 && config.height === 0) {
        // Original — just convert to webp
        processedBuffer = await sharp(fileBuffer)
          .webp({ quality: 85 })
          .toBuffer()
      } else {
        // Resized — fit within dimensions, maintain aspect ratio
        processedBuffer = await sharp(fileBuffer)
          .resize(config.width, config.height, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 85 })
          .toBuffer()
      }

      await writeFile(filePath, processedBuffer)

      // Get metadata for dimensions
      const metadata = await sharp(processedBuffer).metadata()

      results[sizeName] = {
        url: `/uploads/products/${sizeName}/${fileName}`,
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: formatBytes(processedBuffer.length),
      }
    }

    return NextResponse.json({
      success: true,
      fileName: baseName,
      sizes: results,
      // The "main" URL used in product cards (medium size)
      mainUrl: results.medium?.url || results.original?.url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    )
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}