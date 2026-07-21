'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  Package,
  ChevronRight,
  Loader2,
  Shield,
  Edit3,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  items: { productName: string; productImage: string; price: number; quantity: number }[]
}

// ─── Status Colors ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

// ─── Animation ───────────────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { data: session, update: updateSession } = useSession()
  const [profileData, setProfileData] = useState<{
    name: string
    email: string
    phone: string | null
    city: string | null
    country: string | null
    createdAt: string
    orders: Order[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCity, setEditCity] = useState('')
  const [saving, setSaving] = useState(false)

  // Lock body scroll + Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Fetch profile data when drawer opens
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    async function fetchProfile() {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/profile')
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setProfileData(data)
          setEditName(data.name || '')
          setEditPhone(data.phone || '')
          setEditCity(data.city || '')
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProfile()
    return () => { cancelled = true }
  }, [isOpen])

  const handleSaveProfile = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim() || null,
          city: editCity.trim() || null,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setProfileData((prev) => prev ? { ...prev, ...updated } : prev)
        await updateSession({ name: editName.trim() })
        setEditing(false)
        toast.success('Profile updated', { duration: 2000 })
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }, [editName, editPhone, editCity, updateSession])

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: '/' })
    toast.success('Signed out successfully', { duration: 2000 })
    onClose()
  }, [onClose])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const initials = (session?.user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="profile-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[91] bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.aside
            key="profile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-luxury-xl flex flex-col"
          >
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-semibold">My Account</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ─── Content ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : profileData ? (
                <div className="p-6 space-y-6">
                  {/* Profile Card */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-white text-lg font-semibold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-lg font-semibold bg-transparent border-b border-gold outline-none py-0.5"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-lg font-semibold truncate">{profileData.name}</h3>
                      )}
                      <p className="text-sm text-muted-foreground truncate">{profileData.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {profileData.createdAt ? formatDate(profileData.createdAt) : 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {!editing ? (
                      <>
                        <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profileData.phone || 'Not set'} />
                        <InfoRow icon={<MapPin className="w-4 h-4" />} label="City" value={profileData.city || 'Not set'} />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="Phone number"
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/50"
                          />
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <input
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            placeholder="City"
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Edit / Save Buttons */}
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={() => setEditing(false)}
                          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-gold hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Recent Orders */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Recent Orders
                      </h4>
                      {profileData.orders.length > 0 && (
                        <Link
                          href="/orders"
                          onClick={onClose}
                          className="text-xs text-gold font-medium hover:underline flex items-center gap-1"
                        >
                          View All <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {profileData.orders.length === 0 ? (
                      <div className="text-center py-8 bg-muted/30 rounded-2xl">
                        <Package className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No orders yet</p>
                        <Link
                          href="/shop"
                          onClick={onClose}
                          className="text-xs text-gold font-medium hover:underline mt-1 inline-block"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profileData.orders.slice(0, 5).map((order) => (
                          <Link
                            key={order.id}
                            href="/orders"
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                          >
                            {/* Order image thumbnail */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                              {order.items[0]?.productImage && (
                                <Image
                                  src={order.items[0].productImage}
                                  alt={order.items[0].productName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-gold transition-colors">
                                {order.items[0]?.productName || 'Order'}
                                {order.items.length > 1 && ` +${order.items.length - 1} more`}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className={cn(
                                  'text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize',
                                  STATUS_COLORS[order.status] || STATUS_COLORS.pending
                                )}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center py-20">
                  <p className="text-muted-foreground">Unable to load profile</p>
                </div>
              )}
            </div>

            {/* ─── Footer ─────────────────────────────────────────────── */}
            <div className="border-t border-border p-4 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}