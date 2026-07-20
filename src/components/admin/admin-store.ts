import { create } from 'zustand'

interface AdminState {
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  /** If non-null, admin APIs returned 401/403 — show a message */
  authError: string | null
  setAuthError: (msg: string | null) => void
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
}))