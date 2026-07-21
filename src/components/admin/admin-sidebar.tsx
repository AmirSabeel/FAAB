"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Sparkles,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Menu,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
  { icon: Home, label: "Homepage", tab: "homepage" },
  { icon: Package, label: "Products", tab: "products" },
  { icon: TrendingUp, label: "Trending", tab: "trending" },
  { icon: Sparkles, label: "New Arrivals", tab: "new-arrivals" },
  { icon: ShoppingCart, label: "Orders", tab: "orders" },
  { icon: Users, label: "Customers", tab: "customers" },
  { icon: BarChart3, label: "Analytics", tab: "analytics" },
  { icon: Settings, label: "Settings", tab: "settings" },
] as const;

function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 group",
        "px-4 py-3 mx-2",
        isActive
          ? "bg-foreground/5 text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-foreground/3"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="admin-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      <Icon className="w-5 h-5 shrink-0" />

      <span
        className={cn(
          "text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
      >
        {item.label}
      </span>
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function SidebarContent({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
  onMobileSelect,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onMobileSelect?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "font-semibold text-sm tracking-[0.3em] uppercase shrink-0",
                collapsed ? "text-base" : ""
              )}
            >
              {collapsed ? "M" : "FAAB"}
            </span>
            {!collapsed && (
              <span className="text-[10px] text-muted-foreground tracking-[0.2em] ml-1">
                ADMIN
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-200 cursor-pointer",
              collapsed ? "hidden" : ""
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        {collapsed && (
          <button
            onClick={onToggle}
            className="mt-3 mx-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-200 cursor-pointer"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <NavItem
            key={item.tab}
            item={item}
            isActive={activeTab === item.tab}
            collapsed={collapsed}
            onClick={() => {
              onTabChange(item.tab);
              onMobileSelect?.();
            }}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        <a
          href="/"
          className={cn(
            "flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200",
            collapsed && "justify-center"
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span
            className={cn(
              "whitespace-nowrap overflow-hidden transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Back to Store
          </span>
        </a>
      </div>
    </div>
  );
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Mobile: use Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border shadow-luxury-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SidebarContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            collapsed={false}
            onToggle={() => {}}
            onMobileSelect={() => onTabChange(activeTab)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ease-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <SidebarContent
        activeTab={activeTab}
        onTabChange={onTabChange}
        collapsed={collapsed}
        onToggle={onToggle}
      />
    </aside>
  );
}