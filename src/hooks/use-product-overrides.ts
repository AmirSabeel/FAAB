import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface OverrideData {
  price?: number
  originalPrice?: number | null
  image?: string
  name?: string
}

interface ProductOverridesState {
  overrides: Record<string, OverrideData>
  setOverride: (productName: string, data: OverrideData) => void
  removeOverride: (productName: string) => void
}

export const useProductOverridesStore = create<ProductOverridesState>()(
  persist(
    (set) => ({
      overrides: {},
      setOverride: (name, data) =>
        set((state) => ({
          overrides: {
            ...state.overrides,
            [name.toLowerCase().trim()]: {
              ...state.overrides[name.toLowerCase().trim()],
              ...data,
            },
          },
        })),
      removeOverride: (name) =>
        set((state) => {
          const next = { ...state.overrides }
          delete next[name.toLowerCase().trim()]
          return { overrides: next }
        }),
    }),
    {
      name: 'faab-product-overrides-store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
    }
  )
)
