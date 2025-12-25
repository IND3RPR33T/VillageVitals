"use client"

import type React from "react"
import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { UserProfile } from "@/components/user-profile"
import { useTheme } from "next-themes"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Health Reports", href: "/health-report", icon: Activity },
  { name: "Water Quality", href: "/water-quality", icon: Droplets },
  { name: "Health Map", href: "/health-map", icon: MapPin },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Education", href: "/education", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: FileText },
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
  { name: "Sign Out", href: "/api/auth/logout", icon: LogOut },
]

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsNavigation = getSettingsNavigation(theme, setTheme)

  return (
    <div className="flex flex-col h-full">
      {/* Logo and Links */}
      <div className="p-4">
        <Logo />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
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
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <Sidebar />
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
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
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