"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  Activity,
  Droplets,
  MapPin,
  AlertTriangle,
  BookOpen,
  Settings,
  Users,
  FileText,
  LogOut,
  Sun,
  Moon,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserProfile } from "@/components/user-profile"
import { useTheme } from "next-themes"
import { onAuthChange, getCurrentUserProfile } from "@/lib/firebase-auth"
import { UserRole, Module } from "@/lib/rbac/types"
import { hasReadAccess, hasWriteAccess } from "@/lib/rbac/permissions"
import { normalizeRole } from "@/lib/rbac/role-utils"

// Navigation items with module mapping for RBAC
const navigationConfig = [
  { name: "Dashboard", href: "/dashboard", icon: Home, module: "DASHBOARD" as Module },
  { name: "Health Reports", href: "/health-report", icon: Activity, module: "HEALTH_REPORTS" as Module },
  { name: "Water Quality", href: "/water-quality", icon: Droplets, module: "WATER_QUALITY" as Module },
  { name: "Health Map", href: "/health-map", icon: MapPin, module: "HEALTH_MAP" as Module },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle, module: "ALERTS" as Module },
  { name: "Education", href: "/education", icon: BookOpen, module: "EDUCATION" as Module },
  { name: "Reports", href: "/reports", icon: FileText, module: "REPORTS" as Module },
]

type NavItem = {
  name: string
  href?: string
  icon: React.ElementType
  onClick?: () => void
}

// Settings & Profile Navigation
const getSettingsNavigation = (theme: string | undefined, setTheme: (theme: string) => void): NavItem[] => [
  { name: "Profile", href: "/profile", icon: Settings },
  { name: "Community", href: "/community", icon: Users },
  { name: "Dark Mode", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), icon: theme === "dark" ? Sun : Moon },
  { name: "Sign Out", href: "/login", icon: LogOut },
]

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
  userRole: UserRole;
}

function Sidebar({ mobile, onClose, userRole }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsNavigation = getSettingsNavigation(theme, setTheme)
  
  // Filter navigation based on role permissions
  const visibleNavigation = useMemo(() => {
    return navigationConfig.filter(item => hasReadAccess(userRole, item.module))
  }, [userRole])

  const canAccessAdmin = userRole === 'ADMIN'

  return (
    <div className="flex flex-col h-full">
      {/* Logo and Links */}
      <div className="p-4">
        <Logo />
      </div>

      {/* Main Navigation - filtered by RBAC */}
      <nav className="flex-1 space-y-1 p-2">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
              onClick={() => mobile && onClose?.()}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        {/* Admin Link - only visible for ADMIN role */}
        {canAccessAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
              pathname === "/admin" ? "bg-red-600 text-white" : "text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
            )}
            onClick={() => mobile && onClose?.()}
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Settings Navigation */}
      <div className="p-4 border-t">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-muted"
          )}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Settings</span>
          </div>
          <svg
            className={cn("h-4 w-4 transition-transform", isSettingsOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isSettingsOpen && (
          <nav className="mt-1 ml-2 space-y-1 border-l pl-4">
            {settingsNavigation.map((item) => {
              const isActive = item.href ? pathname === item.href : false
              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick?.()
                      mobile && onClose?.()
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors w-full text-left",
                      "hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </button>
                )
              }
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  onClick={() => mobile && onClose?.()}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('USER')
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const profile = await getCurrentUserProfile()
        if (profile?.role) {
          setUserRole(normalizeRole(profile.role))
        } else {
          setUserRole('USER')
        }
      } else {
        setUserRole('USER')
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <Sidebar userRole={userRole} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-40"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile onClose={() => setSidebarOpen(false)} userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <UserProfile />
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}