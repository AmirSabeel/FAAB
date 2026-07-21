import { create } from 'zustand'

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
}

export const useAdminStore = create<AdminState>((set) => ({
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
}))