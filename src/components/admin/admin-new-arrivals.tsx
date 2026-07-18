'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Sparkles,
  X,
  Eye,
  ArrowUpDown,
  Image as ImageIconLucide,
} from 'lucide-react'
import { motion, Reorder } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface NewArrivalProduct {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  image: string
  category: string
  rating: number
  reviewCount: number
  stock: number
  status: string
  isFeatured: boolean
  isNew: boolean
  isTrending: boolean
  newArrivalOrder: number
  createdAt: string
}

interface AllProduct {
  id: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  category: string
  newArrivalOrder: number
  rating: number
  reviewCount: number
}

/* ─── Skeleton ─────────────────────────────────────────── */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Edit Form ────────────────────────────────────────── */
interface EditForm {
  name: string
  description: string
  price: string
  originalPrice: string
  image: string
  category: string
  rating: string
  reviewCount: string
}

const CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  'Accessories',
  'Footwear',
  'Jewelry',
  'Watches',
]

export function AdminNewArrivals() {
  const queryClient = useQueryClient()

  // Fetch new arrival products
  const { data: products = [], isLoading } = useQuery<NewArrivalProduct[]>({
    queryKey: ['admin-new-arrivals'],
    queryFn: () => fetch('/api/admin/new-arrivals').then((r) => r.json()),
  })

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<NewArrivalProduct | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', description: '', price: '', originalPrice: '', image: '', category: '', rating: '', reviewCount: '',
  })
  const [editSaving, setEditSaving] = useState(false)

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<NewArrivalProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Add from catalog modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [debouncedCatalogSearch, setDebouncedCatalogSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCatalogSearch(catalogSearch), 300)
    return () => clearTimeout(timer)
  }, [catalogSearch])

  // Fetch products not in new arrivals
  const { data: catalogProducts = [], isLoading: catalogLoading } = useQuery<AllProduct[]>({
    queryKey: ['admin-catalog-new-arrivals', debouncedCatalogSearch],
    queryFn: () =>
      fetch(
        `/api/admin/products?limit=50&status=active&search=${encodeURIComponent(debouncedCatalogSearch)}`
      )
        .then((r) => r.json())
        .then((data) => data.products || []),
    enabled: addModalOpen,
  })

  // Image preview
  const [imgPreview, setImgPreview] = useState<string | null>(null)

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (items: Array<{ id: string; newArrivalOrder: number }>) => {
      const res = await fetch('/api/admin/new-arrivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: items }),
      })
      if (!res.ok) throw new Error('Failed to reorder')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-new-arrivals'] })
    },
  })

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-new-arrivals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product updated')
      setEditingProduct(null)
    },
    onError: () => toast.error('Failed to update product'),
  })

  // Delete (remove from new arrivals) mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/new-arrivals?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-new-arrivals'] })
      toast.success('Removed from New Arrivals')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to remove'),
  })

  // Add to new arrivals mutation
  const addMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/new-arrivals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isNewArrival: true }),
      })
      if (!res.ok) throw new Error('Failed to add')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-new-arrivals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-catalog-new-arrivals'] })
      toast.success('Added to New Arrivals')
    },
    onError: () => toast.error('Failed to add'),
  })

  // Handlers
  const handleReorder = useCallback(
    (reordered: NewArrivalProduct[]) => {
      const items = reordered.map((p, idx) => ({ id: p.id, newArrivalOrder: idx + 1 }))
      reorderMutation.mutate(items)
    },
    [reorderMutation]
  )

  function openEditModal(product: NewArrivalProduct) {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: product.image,
      category: product.category,
      rating: String(product.rating),
      reviewCount: String(product.reviewCount),
    })
  }

  async function handleEditSave() {
    if (!editingProduct || !editForm.name.trim() || !editForm.price) {
      toast.error('Name and price are required')
      return
    }
    setEditSaving(true)
    await editMutation.mutateAsync({
      id: editingProduct.id,
      name: editForm.name.trim(),
      description: editForm.description.trim() || null,
      price: parseFloat(editForm.price),
      originalPrice: editForm.originalPrice ? parseFloat(editForm.originalPrice) : null,
      image: editForm.image.trim() || editingProduct.image,
      category: editForm.category,
      rating: parseFloat(editForm.rating) || 4.5,
      reviewCount: parseInt(editForm.reviewCount) || 0,
    })
    setEditSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleting(false)
  }

  const nonArrivalCatalog = catalogProducts.filter((p) => !p.newArrivalOrder)

  return (
    <div>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            New Arrivals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in the New Arrivals section
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="h-10 px-5 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Products
        </button>
      </div>

      {/* Reorder Hint */}
      {products.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/40 rounded-xl px-4 py-2.5 border border-border/30">
          <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
          <span>Drag and drop to reorder. Products appear in a horizontal carousel on the storefront.</span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <GridSkeleton />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-medium mb-1">No new arrivals yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add products from your catalog to feature them in the &quot;New Arrivals&quot; carousel on the homepage.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="mt-6 h-10 px-5 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Products
          </button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={products}
          onReorder={handleReorder}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          layoutScroll
        >
          {products.map((product, idx) => (
            <Reorder.Item
              key={product.id}
              value={product}
              className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-luxury-sm hover:shadow-luxury transition-shadow group"
              whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', zIndex: 50 }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Drag Handle + Order Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-white bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    #{idx + 1}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setImgPreview(product.image)}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                    title="Preview image"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(product)}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                    title="Edit product"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="w-8 h-8 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
                    title="Remove from New Arrivals"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* NEW Badge */}
                <span className="absolute bottom-3 left-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  NEW
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium line-clamp-1 flex-1">{product.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-gold">★</span>
                    <span>{product.rating}</span>
                    <span>({product.reviewCount})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Stock: <span className={cn(
                      product.stock > 20 ? 'text-green-600 dark:text-green-400' :
                      product.stock >= 5 ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400',
                      'font-medium'
                    )}>{product.stock}</span>
                  </span>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* ─── Add From Catalog Modal ──────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="bg-card rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-border/50 max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-gold" />
              Add Products to New Arrivals
            </DialogTitle>
          </DialogHeader>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="rounded-xl pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
            {catalogLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : nonArrivalCatalog.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {catalogSearch ? 'No matching products found' : 'All products are already in New Arrivals'}
              </div>
            ) : (
              nonArrivalCatalog.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.category} · ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => addMutation.mutate(product.id)}
                    disabled={addMutation.isPending}
                    className="h-8 px-3 rounded-lg gradient-gold text-white text-xs font-medium flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Product Modal ──────────────────────────── */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="bg-card rounded-3xl p-6 md:p-8 max-w-lg w-full border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit New Arrival Product</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* Image Preview + URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Product Image</Label>
              <div className="aspect-video rounded-xl overflow-hidden bg-muted border border-border/50 mb-2">
                <img
                  src={editForm.image || '/placeholder.png'}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23888"><rect width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="16">No Image</text></svg>'
                    )
                  }}
                />
              </div>
              <div className="relative">
                <ImageIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Image URL (https://...)"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="rounded-xl pl-10"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Product name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Product description..."
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Original Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editForm.originalPrice}
                  onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Category + Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.5"
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Review Count */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Review Count</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={editForm.reviewCount}
                onChange={(e) => setEditForm({ ...editForm, reviewCount: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/50">
            <button
              onClick={() => setEditingProduct(null)}
              className="h-10 px-5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={editSaving || !editForm.name.trim() || !editForm.price}
              className="h-10 px-5 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {editSaving ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border/50 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from New Arrivals?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.name}&quot; from the New Arrivals carousel. The product itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={deleting} className="rounded-xl cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {deleting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Full Image Preview ─────────────────────────── */}
      <Dialog open={!!imgPreview} onOpenChange={(open) => !open && setImgPreview(null)}>
        <DialogContent className="bg-black/95 rounded-3xl p-2 max-w-3xl w-full border-border/20">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <button
              onClick={() => setImgPreview(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {imgPreview && (
              <img
                src={imgPreview}
                alt="Preview"
                className="w-full rounded-2xl object-contain max-h-[70vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}