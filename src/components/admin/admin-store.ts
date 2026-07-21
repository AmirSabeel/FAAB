import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AdminState {
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  authError: string | null
  setAuthError: (msg: string | null) => void
  passwordPromptOpen: boolean
  setPasswordPromptOpen: (v: boolean) => void
  logoutAdmin: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      setIsAdmin: (v) => set({ isAdmin: v, authError: null }),
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      authError: null,
      setAuthError: (msg) => set({ authError: msg }),
      passwordPromptOpen: false,
      setPasswordPromptOpen: (v) => set({ passwordPromptOpen: v }),
      logoutAdmin: () => set({ isAdmin: false, passwordPromptOpen: false }),
    }),
    {
      name: 'faab-admin-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)