"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./admin-sidebar";
import { useAdminStore } from "./admin-store";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const activeTab = useAdminStore((s) => s.activeTab);
  const sidebarCollapsed = useAdminStore((s) => s.sidebarCollapsed);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  const toggleSidebar = useAdminStore((s) => s.toggleSidebar);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <main
        className={cn(
          "transition-all duration-300 ease-out p-6 md:p-8",
          sidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export { AdminSidebar };