'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ui/image-upload'
import { adminFetch } from '@/lib/admin-fetch'
import { useProductOverridesStore } from '@/hooks/use-product-overrides'

const CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  'Accessories',
  'Footwear',
  'Jewelry',
  'Watches',
]

const STATUS_OPTIONS = ['All', 'Active', 'Draft']
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

const COLOR_PRESETS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Ivory', hex: '#f5f0e8' },
  { name: 'Blush', hex: '#e8c4b8' },
  { name: 'Grey', hex: '#8a8a8a' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Beige', hex: '#c8b88a' },
  { name: 'Red', hex: '#cc0000' },
]

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  image: string
  category: string
  stock: number
  status: string
  isFeatured: boolean
  isNew: boolean
  createdAt: string
  sizes?: string
  colors?: string
}

interface ColorOption {
  name: string
  hex: string
}

interface ProductFormData {
  name: string
  description: string
  price: string
  originalPrice: string
  category: string
  stock: string
  image: string
  isFeatured: boolean
  isNew: boolean
  sizes: string[]
  colors: ColorOption[]
}

function safeParseJSON<T>(str: string | undefined | null, fallback: T): T {
  if (!str) return fallback
  try {
    const parsed = JSON.parse(str)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: CATEGORIES[0],
  stock: '',
  image: '',
  isFeatured: false,
  isNew: false,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [],
}

function TableSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-luxury border border-border/50 overflow-hidden">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-border/30 items-center"
        >
          <Skeleton className="h-10 w-10 rounded-xl col-span-1" />
          <Skeleton className="h-4 w-32 col-span-4" />
          <Skeleton className="h-4 w-20 col-span-2" />
          <Skeleton className="h-4 w-16 col-span-2" />
          <Skeleton className="h-4 w-10 col-span-1" />
          <Skeleton className="h-5 w-14 rounded-full col-span-1" />
          <Skeleton className="h-4 w-16 col-span-1" />
        </div>
      ))}
    </div>
  )
}

export function AdminProducts() {
  const queryClient = useQueryClient()

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Color input state
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

  // Fetch products
  const { data, isLoading } = useQuery<{
    products: Product[]
    total: number
    page: number
    totalPages: number
  }>({
    queryKey: ['admin-products', debouncedSearch, category, statusFilter, page],
    queryFn: () =>
      adminFetch(
        `/api/admin/products?search=${encodeURIComponent(debouncedSearch)}&category=${category === 'All' ? '' : category}&status=${statusFilter === 'All' ? '' : statusFilter.toLowerCase()}&page=${page}`
      ).then((r) => r.json()),
  })

  // Save (create/update) mutation
  const saveMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const url = '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(editingProduct ? { id: editingProduct.id, ...body } : body),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to save product')
      }
      return res.json()
    },
    onSuccess: async (updatedProduct: any) => {
      if (updatedProduct?.name) {
        useProductOverridesStore.getState().setOverride(updatedProduct.name, {
          price: Number(updatedProduct.price),
          originalPrice: updatedProduct.originalPrice ? Number(updatedProduct.originalPrice) : null,
          image: updatedProduct.image,
          name: updatedProduct.name,
        })
      }

      queryClient.setQueriesData({ queryKey: ['admin-products'] }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData.products)) return oldData
        const updatedList = oldData.products.map((p: any) => {
          if (
            (updatedProduct.id && p.id === updatedProduct.id) ||
            (updatedProduct.name && p.name.toLowerCase().trim() === updatedProduct.name.toLowerCase().trim())
          ) {
            return { ...p, ...updatedProduct }
          }
          return p
        })
        return { ...oldData, products: updatedList }
      })

      await queryClient.refetchQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully')
      closeModal()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save product')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Product deleted')
      setDeleteTarget(null)
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })

  function openCreateModal() {
    setEditingProduct(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category,
      stock: String(product.stock),
      image: product.image,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      sizes: safeParseJSON<string[]>(product.sizes, ['S', 'M', 'L', 'XL']),
      colors: safeParseJSON<ColorOption[]>(product.colors, []),
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
    setForm(emptyForm)
    setSaving(false)
    setNewColorName('')
    setNewColorHex('#000000')
  }

  // Size toggle helper
  const toggleSize = useCallback((size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }, [])

  // Add custom size
  const addCustomSize = useCallback((size: string) => {
    if (size.trim() && !form.sizes.includes(size.trim())) {
      setForm((prev) => ({ ...prev, sizes: [...prev.sizes, size.trim()] }))
    }
  }, [form.sizes])

  // Color management
  const addColor = useCallback(() => {
    if (newColorName.trim() && newColorHex.trim()) {
      const exists = form.colors.some(
        (c) => c.name.toLowerCase() === newColorName.trim().toLowerCase()
      )
      if (!exists) {
        setForm((prev) => ({
          ...prev,
          colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex.trim() }],
        }))
        setNewColorName('')
      }
    }
  }, [newColorName, newColorHex, form.colors])

  const addPresetColor = useCallback((preset: ColorOption) => {
    const exists = form.colors.some(
      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
    )
    if (!exists) {
      setForm((prev) => ({
        ...prev,
        colors: [...prev.colors, preset],
      }))
    }
  }, [form.colors])

  const removeColor = useCallback((name: string) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.name !== name),
    }))
  }, [])

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      toast.error('Valid price is required')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || '',
        price: parseFloat(form.price),
        originalPrice: form.originalPrice && !isNaN(parseFloat(form.originalPrice)) ? parseFloat(form.originalPrice) : null,
        category: form.category || "Women's Fashion",
        stock: parseInt(form.stock) || 0,
        image: form.image.trim() || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=667&fit=crop&q=80',
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        status: 'active',
        sizes: form.sizes,
        colors: form.colors,
      }
      await saveMutation.mutateAsync(body)
    } catch {
      // Error handled by mutation onError
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleting(false)
  }

  function stockColor(stock: number) {
    if (stock > 20) return 'text-green-600 dark:text-green-400'
    if (stock >= 5) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const products = data?.products || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1
  const startItem = (page - 1) * 20 + 1
  const endItem = Math.min(page * 20, total)

  return (
    <div>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} product{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-72 rounded-xl bg-muted/50 border border-border pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="h-10 px-5 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat)
              setPage(1)
            }}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium border border-border cursor-pointer transition-all whitespace-nowrap',
              category === cat
                ? 'bg-foreground text-background border-foreground'
                : 'hover:border-foreground/30'
            )}
          >
            {cat}
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1 shrink-0" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s)
              setPage(1)
            }}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium border border-border cursor-pointer transition-all whitespace-nowrap',
              statusFilter === s
                ? 'bg-foreground text-background border-foreground'
                : 'hover:border-foreground/30'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl shadow-luxury border border-border/50 overflow-hidden mt-2"
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Stock</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          {products.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground text-sm">
              No products found
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-border/30 items-center hover:bg-muted/20 transition-colors"
                >
                  {/* Product */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {product.isFeatured && (
                          <span className="text-[10px] font-medium text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        {product.isNew && (
                          <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 text-sm text-muted-foreground truncate">
                    {product.category}
                  </div>

                  {/* Price */}
                  <div className="col-span-2">
                    <span className="text-sm font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through ml-1.5">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className={cn('col-span-1 text-sm font-medium', stockColor(product.stock))}>
                    {product.stock}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span
                      className={cn(
                        'text-[11px] font-medium px-2.5 py-0.5 rounded-full',
                        product.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {product.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                      aria-label="Edit product"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      aria-label="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}–{endItem} of {total} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-9 px-3 rounded-xl border border-border text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors cursor-pointer disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-9 px-3 rounded-xl border border-border text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors cursor-pointer disabled:hover:bg-transparent"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="bg-card rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-border/50 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2 overflow-y-auto pr-1 max-h-[65vh]">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="prod-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prod-name"
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="prod-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="prod-desc"
                placeholder="Product description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Price & Original Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-price" className="text-sm font-medium">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-orig-price" className="text-sm font-medium">
                  Original Price
                </Label>
                <Input
                  id="prod-orig-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Category & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-cat" className="text-sm font-medium">
                  Category
                </Label>
                <select
                  id="prod-cat"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-stock" className="text-sm font-medium">
                  Stock
                </Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Image Upload */}
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              label="Product Image"
            />

            {/* Sizes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'h-9 min-w-[3rem] px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                      form.sizes.includes(size)
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border hover:border-foreground/40'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {/* Custom size input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Custom size (e.g. 28, 30, 32)"
                  className="rounded-xl text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomSize((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                    if (input) {
                      addCustomSize(input.value)
                      input.value = ''
                    }
                  }}
                  className="h-10 px-3 rounded-xl border border-border text-xs font-medium hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
              {form.sizes.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {form.sizes.join(', ')}
                </p>
              )}
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Colors</Label>

              {/* Already added colors */}
              {form.colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.colors.map((color) => (
                    <div
                      key={color.name}
                      className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border border-border bg-muted/30"
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-border/50 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-medium">{color.name}</span>
                      <button
                        type="button"
                        onClick={() => removeColor(color.name)}
                        className="ml-0.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add custom color */}
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-muted-foreground">Color Name</Label>
                  <Input
                    placeholder="e.g. Midnight Blue"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="rounded-xl text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hex</Label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
                    />
                    <Input
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="rounded-xl text-sm h-9 w-24 font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addColor}
                  className="h-9 px-3 rounded-xl gradient-gold text-white text-xs font-medium cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Quick-add preset colors */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((preset) => {
                    const alreadyAdded = form.colors.some(
                      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                    )
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => addPresetColor(preset)}
                        disabled={alreadyAdded}
                        className={cn(
                          'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border transition-all cursor-pointer',
                          alreadyAdded
                            ? 'opacity-40 cursor-not-allowed border-border'
                            : 'border-border hover:border-foreground/40 hover:bg-muted/50'
                        )}
                        title={preset.name}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border/50 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        {preset.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prod-featured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isFeatured: !!checked })
                  }
                />
                <Label htmlFor="prod-featured" className="text-sm cursor-pointer">
                  Featured
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="prod-new"
                  checked={form.isNew}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isNew: !!checked })
                  }
                />
                <Label htmlFor="prod-new" className="text-sm cursor-pointer">
                  New Arrival
                </Label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/50">
            <button
              onClick={closeModal}
              className="h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving
                ? 'Saving...'
                : editingProduct
                  ? 'Update Product'
                  : 'Create Product'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border/50 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product &quot;{deleteTarget?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}