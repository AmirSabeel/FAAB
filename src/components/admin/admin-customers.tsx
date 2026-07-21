'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Users } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

// ---------- Types ----------

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  city: string | null
  country: string | null
  totalSpent: number
  orderCount: number
  createdAt: string
}

// ---------- Helpers ----------

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------- Component ----------

export function AdminCustomers() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, page],
    queryFn: () =>
      adminFetch(`/api/admin/customers?search=${encodeURIComponent(search)}&page=${page}`).then((r) => r.json()),
  })

  const customers: Customer[] = data?.customers ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} customer{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 rounded-xl bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {isLoading ? (
        /* Desktop Table Skeleton */
        <div className="hidden md:block bg-card rounded-2xl shadow-luxury border border-border/50 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30">
            <Skeleton className="h-3 w-16 col-span-4" />
            <Skeleton className="h-3 w-16 col-span-3" />
            <Skeleton className="h-3 w-16 col-span-2" />
            <Skeleton className="h-3 w-12 col-span-1" />
            <Skeleton className="h-3 w-14 col-span-1" />
            <Skeleton className="h-3 w-16 col-span-1" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-border/30 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-36 col-span-3" />
              <Skeleton className="h-4 w-24 col-span-2" />
              <Skeleton className="h-4 w-8 col-span-1" />
              <Skeleton className="h-4 w-14 col-span-1" />
              <Skeleton className="h-4 w-16 col-span-1" />
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">No customers found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-2xl shadow-luxury border border-border/50 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Customer</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Orders</div>
              <div className="col-span-1">Spent</div>
              <div className="col-span-1">Joined</div>
            </div>

            {/* Rows */}
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-t border-border/30 items-center hover:bg-muted/20 transition-colors"
              >
                {/* Customer */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {getInitials(customer.name)}
                    </span>
                  </div>
                  <span className="text-sm font-medium truncate">{customer.name}</span>
                </div>

                {/* Email */}
                <div className="col-span-3">
                  <span className="text-sm text-muted-foreground truncate block">{customer.email}</span>
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground truncate block">
                    {[customer.city, customer.country].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>

                {/* Orders */}
                <div className="col-span-1">
                  <span className="text-sm">{customer.orderCount}</span>
                </div>

                {/* Spent */}
                <div className="col-span-1">
                  <span className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</span>
                </div>

                {/* Joined */}
                <div className="col-span-1">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-card rounded-2xl p-4 shadow-luxury border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {getInitials(customer.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Location: </span>
                    <span className="font-medium">
                      {[customer.city, customer.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Orders: </span>
                    <span className="font-medium">{customer.orderCount}</span>
                  </div>
                  <div className="text-xs ml-auto">
                    <span className="text-muted-foreground">Spent: </span>
                    <span className="font-semibold text-gold">{formatCurrency(customer.totalSpent)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}