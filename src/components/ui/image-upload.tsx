'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface SizeInfo {
  url: string
  width: number
  height: number
  size: string
}

interface UploadResult {
  success: boolean
  fileName: string
  sizes: Record<string, SizeInfo>
  mainUrl: string
}

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

const SIZE_LABELS: Record<string, string> = {
  thumb: 'Thumbnail (100×133)',
  small: 'Small (300×400)',
  medium: 'Medium (500×667)',
  large: 'Large (800×1067)',
  original: 'Original',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUpload({ value, onChange, label = 'Product Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    // Validate
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Use JPG, PNG, WebP, GIF, or AVIF.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.`)
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        let msg = 'Upload failed'
        try {
          const data = await res.json()
          msg = data.error || msg
        } catch {
          msg = `Server error (${res.status}). Is the upload API available?`
        }
        throw new Error(msg)
      }

      let data: UploadResult
      try {
        data = await res.json()
      } catch {
        throw new Error('Invalid response from server')
      }
      setProgress(100)

      setTimeout(() => {
        setUploadResult(data)
        onChange(data.mainUrl)
        setUploading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }, [handleFile])

  const clearImage = useCallback(() => {
    onChange('')
    setUploadResult(null)
    setError(null)
    setProgress(0)
  }, [onChange])

  const hasImage = !!value && value.trim().length > 0

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {/* Upload Zone / Preview */}
      {!hasImage && !uploading ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 min-h-[200px]',
            isDragging
              ? 'border-gold bg-gold/5 scale-[1.02]'
              : 'border-border/60 hover:border-gold/50 hover:bg-muted/30'
          )}
        >
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
            isDragging ? 'bg-gold/10' : 'bg-muted/50'
          )}>
            <Upload className={cn('w-6 h-6', isDragging ? 'text-gold' : 'text-muted-foreground')} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP, GIF, AVIF — Max 10MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : uploading ? (
        /* Upload Progress */
        <div className="rounded-2xl border border-border/50 p-6 flex flex-col items-center justify-center min-h-[200px] bg-muted/20">
          <Loader2 className="w-8 h-8 text-gold animate-spin mb-3" />
          <p className="text-sm font-medium mb-3">Uploading & processing image...</p>
          <div className="w-full max-w-xs">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full gradient-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1.5">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      ) : (
        /* Image Preview with remove */
        <div className="space-y-3">
          {/* Main Preview */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 bg-muted">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23888"><rect width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="16">Image not found</text></svg>'
                )
              }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 h-8 px-3 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs font-medium gap-1.5 hover:bg-black/80 transition-colors cursor-pointer"
              title="Replace image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Replace
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* All Sizes Grid */}
          {uploadResult && uploadResult.sizes && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    {Object.keys(uploadResult.sizes).length} sizes generated
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(uploadResult.sizes).map(([sizeName, info]) => (
                    <div
                      key={sizeName}
                      className="rounded-xl border border-border/40 overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={info.url}
                          alt={`${sizeName} preview`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-2 py-1.5 space-y-0.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground">
                          {SIZE_LABELS[sizeName] || sizeName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {info.width}×{info.height} · {info.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}