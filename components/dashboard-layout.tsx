import type React from "react"
import { useState } from "react"
import {
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
  ShieldCheck,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { UserProfile } from "@/components/user-profile"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/dashboard-sidebar"
import { useAuth } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Health Reports", href: "/health-report", icon: Activity },
  { name: "Water Quality", href: "/water-quality", icon: Droplets },
  { name: "Health Map", href: "/health-map", icon: MapPin },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Education", href: "/education", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: FileText },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const links = navigation.map(item => ({
    label: item.name,
    href: item.href,
    icon: <item.icon className="h-5 w-5 flex-shrink-0" />,
  }))

  if (user?.role === 'admin') {
    links.push({
      label: "Admin Panel",
      href: "/admin",
      icon: <ShieldCheck className="h-5 w-5 flex-shrink-0" />,
    })
  }

  const settingsLinks = [
    { label: "Profile", href: "/profile", icon: <Settings className="h-5 w-5 flex-shrink-0" /> },
    { label: "Community", href: "/community", icon: <Users className="h-5 w-5 flex-shrink-0" /> },

    { label: "Sign Out", href: "/api/auth/logout", icon: <LogOut className="h-5 w-5 flex-shrink-0" /> },
  ]

  return (
    <div className={cn("rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden", "h-screen")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-start gap-2 group/sidebar">
              <div className="p-1">
                <Logo size="sm" />
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
            {settingsLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
            <div className="mt-2 flex items-center gap-2 px-2 py-2">
              <UserProfile compact={!open} />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-y-auto h-full">
        <main className="p-2 md:p-6 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full min-h-full">
          {children}
        </main>
      </div>
    </div>
  )
}