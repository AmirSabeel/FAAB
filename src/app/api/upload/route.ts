import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

// ─── Size configurations ────────────────────────────────────────────────────

const SIZES = {
  thumb:   { width: 100,  height: 133, suffix: 'thumb' },
  small:   { width: 300,  height: 400, suffix: 'small' },
  medium:  { width: 500,  height: 667, suffix: 'medium' },
  large:   { width: 800,  height: 1067, suffix: 'large' },
  original: { width: null, height: null, suffix: 'original' },
} as const

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function fileExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  }
  return map[mimeType] || 'jpg'
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, WebP, GIF, or AVIF.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${formatBytes(file.size)}). Max 10MB.` },
        { status: 400 }
      )
    }

    // Read the file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = fileExtension(file.type)
    const baseName = `${timestamp}-${random}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')

    // Ensure all size directories exist
    for (const sizeKey of Object.keys(SIZES)) {
      const dir = path.join(uploadDir, sizeKey)
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
    }

    // Process and save each size
    const sizes: Record<string, { url: string; width: number; height: number; size: string }> = {}
    let mainUrl = ''

    for (const [sizeKey, config] of Object.entries(SIZES)) {
      const fileName = `${baseName}-${config.suffix}.${ext}`
      const filePath = path.join(uploadDir, sizeKey, fileName)

      let processedBuffer: Buffer
      let width: number
      let height: number

      if (config.width && config.height) {
        // Resize to fit within dimensions, maintaining aspect ratio, then center-crop
        const metadata = await sharp(buffer).metadata()
        width = config.width
        height = config.height

        processedBuffer = await sharp(buffer)
          .resize(config.width, config.height, { fit: 'cover' })
          .webp({ quality: 85 })
          .toBuffer()

        // Use webp extension for processed sizes
        const webpFileName = `${baseName}-${config.suffix}.webp`
        const webpFilePath = path.join(uploadDir, sizeKey, webpFileName)
        await writeFile(webpFilePath, processedBuffer)

        const url = `/uploads/products/${sizeKey}/${webpFileName}`
        sizes[sizeKey] = {
          url,
          width,
          height,
          size: formatBytes(processedBuffer.length),
        }

        // Use the "medium" size as the main URL for product display
        if (sizeKey === 'medium') {
          mainUrl = url
        }
      } else {
        // Original — save as-is
        width = (await sharp(buffer).metadata()).width || 0
        height = (await sharp(buffer).metadata()).height || 0

        // Convert original to webp too for consistency
        processedBuffer = await sharp(buffer)
          .webp({ quality: 90 })
          .toBuffer()

        const webpFileName = `${baseName}-${config.suffix}.webp`
        const webpFilePath = path.join(uploadDir, sizeKey, webpFileName)
        await writeFile(webpFilePath, processedBuffer)

        const url = `/uploads/products/${sizeKey}/${webpFileName}`
        sizes[sizeKey] = {
          url,
          width,
          height,
          size: formatBytes(processedBuffer.length),
        }

        // Fallback: use original as main URL if medium wasn't set
        if (!mainUrl) {
          mainUrl = url
        }
      }
    }

    return NextResponse.json({
      success: true,
      fileName: `${baseName}.${ext}`,
      sizes,
      mainUrl,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}