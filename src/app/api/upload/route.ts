import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const SIZES = [
  { name: 'thumb', width: 100, height: 133 },
  { name: 'small', width: 300, height: 400 },
  { name: 'medium', width: 500, height: 667 },
  { name: 'large', width: 800, height: 1067 },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function POST(req: NextRequest) {
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
        { error: `File too large (${formatBytes(file.size)}). Max 10MB.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'webp'
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const sizes: Record<string, { url: string; width: number; height: number; size: string }> = {}

    // Process each size
    for (const size of SIZES) {
      const dir = path.join(process.cwd(), 'public', 'uploads', size.name)
      await mkdir(dir, { recursive: true })

      const fileName = `${baseName}.webp`
      const filePath = path.join(dir, fileName)

      await sharp(buffer)
        .resize(size.width, size.height, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(filePath)

      const stat = await import('fs').then(fs => fs.promises.stat(filePath))
      sizes[size.name] = {
        url: `/uploads/${size.name}/${fileName}`,
        width: size.width,
        height: size.height,
        size: formatBytes(stat.size),
      }
    }

    // Save original
    const origDir = path.join(process.cwd(), 'public', 'uploads', 'original')
    await mkdir(origDir, { recursive: true })
    const origFileName = `${baseName}.webp`
    const origPath = path.join(origDir, origFileName)

    await sharp(buffer)
      .webp({ quality: 90 })
      .toFile(origPath)

    const origStat = await import('fs').then(fs => fs.promises.stat(origPath))
    const metadata = await sharp(buffer).metadata()
    sizes['original'] = {
      url: `/uploads/original/${origFileName}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: formatBytes(origStat.size),
    }

    return NextResponse.json({
      success: true,
      fileName: `${baseName}.webp`,
      sizes,
      mainUrl: sizes.medium?.url || sizes.original?.url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}