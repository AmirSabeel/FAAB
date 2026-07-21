'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Store,
  Truck,
  Share2,
  Bell,
  Save,
  RotateCcw,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/admin-fetch'

// ---------- Types ----------

interface Setting {
  key: string
  value: string
  group: string
  label: string
  type: string
  order: number
  updatedAt: string
}

interface GroupConfig {
  key: string
  label: string
  icon: React.ElementType
  description: string
}

// ---------- Config ----------

const GROUPS: GroupConfig[] = [
  { key: 'general', label: 'Store Information', icon: Store, description: 'Basic store details and contact information' },
  { key: 'tax_shipping', label: 'Tax & Shipping', icon: Truck, description: 'Tax rates and shipping configuration' },
  { key: 'social', label: 'Social Media', icon: Share2, description: 'Your social media profile links' },
  { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification preferences' },
]

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  social_instagram: Instagram,
  social_facebook: Facebook,
  social_twitter: Twitter,
  social_youtube: Youtube,
  social_pinterest: Share2,
}

// ---------- Component ----------

export function AdminSettings() {
  const queryClient = useQueryClient()
  const [activeGroup, setActiveGroup] = useState('general')
  const [localValues, setLocalValues] = useState<Record<string, string>>({})

  // Fetch settings
  const { data, isLoading } = useQuery<{ settings: Setting[] }>({
    queryKey: ['admin-settings'],
    queryFn: () => adminFetch('/api/admin/settings').then((r) => r.json()),
  })

  const settings = data?.settings || []

  // Initialize local values when data loads
  useEffect(() => {
    if (settings.length > 0 && Object.keys(localValues).length === 0) {
      const vals: Record<string, string> = {}
      settings.forEach((s) => { vals[s.key] = s.value })
      setLocalValues(vals)
    }
  }, [settings, localValues])

  // Group settings
  const groupedSettings = useMemo(() => {
    const map: Record<string, Setting[]> = {}
    for (const group of GROUPS) map[group.key] = []
    settings.forEach((s) => {
      if (map[s.group]) map[s.group].push(s)
    })
    return map
  }, [settings])

  const currentSettings = groupedSettings[activeGroup] || []

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Array<{ key: string; value: string }>) => {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: updates }),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  function updateValue(key: string, value: string) {
    setLocalValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    const updates = currentSettings.map((s) => ({
      key: s.key,
      value: localValues[s.key] ?? s.value,
    }))
    saveMutation.mutate(updates)
  }

  function handleReset() {
    const vals: Record<string, string> = {}
    currentSettings.forEach((s) => { vals[s.key] = s.value })
    setLocalValues((prev) => ({ ...prev, ...vals }))
    toast.info('Changes discarded')
  }

  const hasChanges = currentSettings.some((s) => localValues[s.key] !== s.value)

  const activeGroupConfig = GROUPS.find((g) => g.key === activeGroup)!

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your store configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="h-10 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasChanges}
            className="h-10 px-5 rounded-xl gradient-gold text-white text-sm font-medium btn-ripple flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-5 py-3 flex items-center justify-between"
        >
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            You have unsaved changes
          </p>
          <button
            onClick={handleSave}
            className="text-sm font-medium text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
          >
            Save now
          </button>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Group Navigation */}
        <div className="lg:w-72 shrink-0">
          <nav className="bg-card rounded-2xl shadow-luxury border border-border/50 p-2 space-y-1 lg:sticky lg:top-6">
            {GROUPS.map((group) => {
              const Icon = group.icon
              const isActive = activeGroup === group.key
              return (
                <button
                  key={group.key}
                  onClick={() => setActiveGroup(group.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'bg-foreground/5 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/3'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                    isActive ? 'bg-gold/10 text-gold' : 'bg-muted/50'
                  )}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', isActive && 'text-foreground')}>
                      {group.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">
                      {group.description}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    'w-4 h-4 shrink-0 transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )} />
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right: Settings Form */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="bg-card rounded-2xl shadow-luxury border border-border/50 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card rounded-2xl shadow-luxury border border-border/50 p-6"
            >
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/50">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  {(() => {
                    const Icon = activeGroupConfig.icon
                    return <Icon className="w-5 h-5 text-gold" />
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{activeGroupConfig.label}</h3>
                  <p className="text-sm text-muted-foreground">{activeGroupConfig.description}</p>
                </div>
              </div>

              {/* Settings Fields */}
              <div className="space-y-5">
                {currentSettings.map((setting) => {
                  const currentValue = localValues[setting.key] ?? setting.value
                  const SocialIcon = SOCIAL_ICONS[setting.key]

                  return (
                    <div key={setting.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={setting.key} className="text-sm font-medium flex items-center gap-2">
                          {SocialIcon && <SocialIcon className="w-4 h-4 text-muted-foreground" />}
                          {setting.label}
                        </Label>
                        {setting.type === 'toggle' && (
                          <Switch
                            id={setting.key}
                            checked={currentValue === 'true'}
                            onCheckedChange={(checked) =>
                              updateValue(setting.key, checked ? 'true' : 'false')
                            }
                          />
                        )}
                      </div>

                      {setting.type === 'text' && (
                        <div className={cn(SocialIcon && 'relative')}>
                          {SocialIcon && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <SocialIcon className="w-4 h-4" />
                            </div>
                          )}
                          <Input
                            id={setting.key}
                            value={currentValue}
                            onChange={(e) => updateValue(setting.key, e.target.value)}
                            className={cn('rounded-xl', SocialIcon && 'pl-10')}
                            placeholder={setting.label}
                          />
                          {currentValue && setting.value.startsWith('http') && (
                            <a
                              href={currentValue}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}

                      {setting.type === 'textarea' && (
                        <Textarea
                          id={setting.key}
                          value={currentValue}
                          onChange={(e) => updateValue(setting.key, e.target.value)}
                          rows={3}
                          className="rounded-xl resize-none"
                          placeholder={setting.label}
                        />
                      )}

                      {setting.type === 'number' && (
                        <div className="relative max-w-xs">
                          {setting.key.includes('rate') || setting.key.includes('threshold') || setting.key.includes('shipping') ? (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              {setting.key.includes('rate') ? '%' : '₹'}
                            </span>
                          ) : null}
                          <Input
                            id={setting.key}
                            type="number"
                            min="0"
                            step={setting.key === 'tax_rate' ? '0.5' : '1'}
                            value={currentValue}
                            onChange={(e) => updateValue(setting.key, e.target.value)}
                            className={cn(
                              'rounded-xl',
                              (setting.key.includes('rate') || setting.key.includes('threshold') || setting.key.includes('shipping')) && 'pl-8'
                            )}
                          />
                        </div>
                      )}

                      {setting.type === 'select' && setting.key === 'store_currency' && (
                        <select
                          id={setting.key}
                          value={currentValue}
                          onChange={(e) => updateValue(setting.key, e.target.value)}
                          className="w-full h-10 max-w-xs rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all cursor-pointer"
                        >
                          <option value="INR">INR - Indian Rupee (₹)</option>
                          <option value="USD">USD - US Dollar ($)</option>
                          <option value="EUR">EUR - Euro (€)</option>
                          <option value="GBP">GBP - British Pound (£)</option>
                          <option value="AED">AED - UAE Dirham (د.إ)</option>
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Group Footer Info */}
              {activeGroup === 'tax_shipping' && (
                <div className="mt-6 pt-5 border-t border-border/50">
                  <div className="rounded-xl bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Tip:</span> Tax is calculated on the subtotal before shipping.
                      When the free shipping threshold is enabled, orders above the specified amount will automatically qualify for free shipping.
                      These settings apply to all new orders.
                    </p>
                  </div>
                </div>
              )}

              {activeGroup === 'social' && (
                <div className="mt-6 pt-5 border-t border-border/50">
                  <div className="rounded-xl bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Tip:</span> Social media links are displayed in the footer of your storefront.
                      Leave a field empty to hide that social icon from the footer.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}