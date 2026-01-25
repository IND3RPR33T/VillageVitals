"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "firebase/auth"
import { onAuthChange, getCurrentUserProfile, type UserProfile } from "@/lib/firebase-auth"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        router.push("/login")
        return
      }

      try {
        // Get user profile from Firestore
        const profile = await getCurrentUserProfile()

        if (profile) {
          // Check if user role is allowed
          if (allowedRoles && !allowedRoles.includes(profile.role)) {
            router.push("/unauthorized")
            return
          }

          setUser(profile)
          setIsAuthenticated(true)
        } else {
          // Create minimal profile from Firebase user
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: firebaseUser.displayName?.split(' ')[0] || '',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'user',
            isVerified: true,
            createdAt: null,
            updatedAt: null,
          })
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, allowedRoles])

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

// Export user context hook for use in components
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getCurrentUserProfile()
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
