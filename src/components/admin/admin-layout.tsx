"use client";

import React, { useState, createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./admin-sidebar";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminContextValue {
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AdminContext = createContext<AdminContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

const defaultContext: AdminContextValue = {
  isAdmin: false,
  setIsAdmin: () => {},
  activeTab: 'dashboard',
  setActiveTab: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
};

function useAdmin() {
  const ctx = useContext(AdminContext);
  return ctx ?? defaultContext;
}

// ─── Layout Component ────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      <div className="min-h-screen bg-background">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Main content area — adjusts margin based on sidebar state */}
        <main
          className={cn(
            "transition-all duration-300 ease-out p-6 md:p-8",
            sidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
          )}
        >
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}

export { AdminLayout, AdminSidebar, useAdmin };