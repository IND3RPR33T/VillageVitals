"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  LogOut, 
  Mail,
  Phone,
  Shield,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserProfileProps {
  compact?: boolean; // For mobile version
}

export function UserProfile({ compact = false }: UserProfileProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'health-worker':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'community':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatRole = (role: string) => {
    return role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        {!compact && <div className="w-24 h-4 bg-gray-200 rounded"></div>}
      </div>
    )
  }

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">
          <User className="w-4 h-4 mr-2" />
          Login
        </Link>
      </Button>
    )
  }

  if (compact) {
    // Mobile compact version
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/api/placeholder/32/32?text=${getInitials(user.firstName, user.lastName)}`} />
              <AvatarFallback className="text-xs">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Desktop full version
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={`/api/placeholder/40/40?text=${getInitials(user.firstName, user.lastName)}`} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">
                  {user.firstName} {user.lastName}
                </span>
                {user.isVerified && (
                  <Shield className="w-3 h-3 text-green-600 fill-green-100" />
                )}
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-0 ${getRoleColor(user.role)}`}
              >
                {formatRole(user.role)}
              </Badge>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* Profile Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
              <AvatarImage src={`/api/placeholder/48/48?text=${getInitials(user.firstName, user.lastName)}`} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </h3>
                {user.isVerified && (
                  <Shield className="w-4 h-4 text-green-600 fill-green-100" />
                )}
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs w-fit ${getRoleColor(user.role)}`}
              >
                {formatRole(user.role)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-3 px-4 py-2">
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-2">
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
