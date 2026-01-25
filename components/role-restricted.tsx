"use client"

import { ReactNode } from "react"
import { useRBAC } from "@/lib/rbac/hooks"
import { UserRole, Module } from "@/lib/rbac/types"
import { cn } from "@/lib/utils"

interface RoleRestrictedProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredModule?: Module
  requireWrite?: boolean
  fallback?: ReactNode
  showBlurred?: boolean
  className?: string
}

export function RoleRestricted({
  children,
  requiredRole,
  requiredModule,
  requireWrite = false,
  fallback,
  showBlurred = true,
  className
}: RoleRestrictedProps) {
  const { role, canRead, canWrite, isLoading } = useRBAC()

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)}>
        <div className="h-full w-full" />
      </div>
    )
  }

  // Check role-based access
  let hasPermission = true

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    hasPermission = roles.includes(role)
  }

  if (requiredModule) {
    hasPermission = hasPermission && (requireWrite ? canWrite(requiredModule) : canRead(requiredModule))
  }

  // If user has permission, show content normally
  if (hasPermission) {
    return <>{children}</>
  }

  // If no permission and showBlurred is true, show blurred version
  if (showBlurred) {
    return (
      <div className={cn("relative", className)}>
        {/* Blurred content */}
        <div className="filter blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay with restriction message */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4 max-w-xs">
            <div className="text-gray-600 font-medium mb-2">
              🔒 Access Restricted
            </div>
            <div className="text-sm text-gray-500">
              {getRoleMessage(role, requiredRole)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If showBlurred is false, show fallback or nothing
  return fallback ? <>{fallback}</> : null
}

function getRoleMessage(currentRole: UserRole, requiredRole?: UserRole | UserRole[]): string {
  if (!requiredRole) {
    return "You don't have permission to access this feature."
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const roleNames = roles.map(r => {
    switch (r) {
      case 'ADMIN': return 'Administrator'
      case 'HEALTH_OFFICIAL': return 'Health Official'
      case 'FIELD_WORKER': return 'Field Worker'
      case 'ASHA_WORKER': return 'ASHA Worker'
      case 'USER': return 'User'
      default: return r
    }
  })

  if (roleNames.length === 1) {
    return `This feature is only available to ${roleNames[0]}s.`
  }

  return `This feature is only available to: ${roleNames.join(', ')}.`
}

// Convenience components for common restrictions
export function AdminOnly({ children, showBlurred = true, className, fallback }: Omit<RoleRestrictedProps, 'requiredRole'>) {
  return (
    <RoleRestricted 
      requiredRole="ADMIN" 
      showBlurred={showBlurred} 
      className={className}
      fallback={fallback}
    >
      {children}
    </RoleRestricted>
  )
}

export function HealthOfficialOnly({ children, showBlurred = true, className, fallback }: Omit<RoleRestrictedProps, 'requiredRole'>) {
  return (
    <RoleRestricted 
      requiredRole={['ADMIN', 'HEALTH_OFFICIAL']} 
      showBlurred={showBlurred} 
      className={className}
      fallback={fallback}
    >
      {children}
    </RoleRestricted>
  )
}

export function FieldWorkerPlus({ children, showBlurred = true, className, fallback }: Omit<RoleRestrictedProps, 'requiredRole'>) {
  return (
    <RoleRestricted 
      requiredRole={['ADMIN', 'HEALTH_OFFICIAL', 'FIELD_WORKER']} 
      showBlurred={showBlurred} 
      className={className}
      fallback={fallback}
    >
      {children}
    </RoleRestricted>
  )
}