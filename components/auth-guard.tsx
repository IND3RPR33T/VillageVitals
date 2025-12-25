"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        
        // Check if user role is allowed
        if (allowedRoles && !allowedRoles.includes(data.user.role)) {
          router.push("/unauthorized")
          return
        }
        
        setIsAuthenticated(true)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-health">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-primary-foreground rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
