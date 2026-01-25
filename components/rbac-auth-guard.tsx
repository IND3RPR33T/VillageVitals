"use client";

// ============================================================
// RBAC AUTH GUARD COMPONENT
// ============================================================
// Protected route component with RBAC enforcement
// Replaces the basic auth-guard with full permission checking

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { onAuthChange, getCurrentUserProfile, type UserProfile } from "@/lib/firebase-auth";
import { UserRole, Module } from "@/lib/rbac/types";
import { hasReadAccess, hasWriteAccess } from "@/lib/rbac/permissions";
import { normalizeRole, DEFAULT_ROLE } from "@/lib/rbac/role-utils";

interface RBACAuthGuardProps {
  children: React.ReactNode;
  /** Required module - user must have READ access to this module */
  requiredModule?: Module;
  /** Allowed roles - user must have one of these roles */
  allowedRoles?: UserRole[];
  /** Require write access to the module (default: false, only requires read) */
  requireWrite?: boolean;
  /** Custom unauthorized redirect path */
  unauthorizedPath?: string;
  /** Custom login redirect path */
  loginPath?: string;
  /** Show loading state */
  loadingComponent?: React.ReactNode;
}

/**
 * RBAC Auth Guard
 * 
 * Protects routes based on:
 * 1. Authentication status
 * 2. Required module access (read or write)
 * 3. Specific role requirements
 * 
 * Usage:
 * ```tsx
 * <RBACAuthGuard requiredModule="ADMIN_PANEL" allowedRoles={['ADMIN']}>
 *   <AdminPage />
 * </RBACAuthGuard>
 * ```
 */
export function RBACAuthGuard({
  children,
  requiredModule,
  allowedRoles,
  requireWrite = false,
  unauthorizedPath = "/unauthorized",
  loginPath = "/login",
  loadingComponent,
}: RBACAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setIsAuthenticated(false);
        setUser(null);
        setRole(DEFAULT_ROLE);
        setIsLoading(false);
        router.push(loginPath);
        return;
      }

      try {
        // Get user profile from Firestore
        const profile = await getCurrentUserProfile();

        if (profile) {
          const normalizedRole = normalizeRole(profile.role);
          
          // Check role-based access
          if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
            console.warn(`Access denied: Role ${normalizedRole} not in allowed roles`);
            router.push(unauthorizedPath);
            return;
          }

          // Check module-based access
          if (requiredModule) {
            const hasAccess = requireWrite
              ? hasWriteAccess(normalizedRole, requiredModule)
              : hasReadAccess(normalizedRole, requiredModule);

            if (!hasAccess) {
              console.warn(`Access denied: Role ${normalizedRole} cannot access ${requiredModule}`);
              router.push(unauthorizedPath);
              return;
            }
          }

          setUser(profile);
          setRole(normalizedRole);
          setIsAuthenticated(true);
        } else {
          // Create minimal profile from Firebase user with default role
          const defaultRole = normalizeRole("user"); // This will return "USER"
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            firstName: firebaseUser.displayName?.split(" ")[0] || "",
            lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
            role: "user", // Use lowercase for consistency with Firestore
            isVerified: true,
            createdAt: null,
            updatedAt: null,
          });
          setRole(defaultRole);
          setIsAuthenticated(true);

          // Check if USER role has access
          if (allowedRoles && !allowedRoles.includes(defaultRole)) {
            router.push(unauthorizedPath);
            return;
          }

          if (requiredModule && !hasReadAccess(defaultRole, requiredModule)) {
            router.push(unauthorizedPath);
            return;
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push(loginPath);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, allowedRoles, requiredModule, requireWrite, unauthorizedPath, loginPath]);

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-health">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-primary-foreground rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// ============================================================
// SPECIALIZED GUARDS
// ============================================================

interface ModuleGuardProps {
  children: React.ReactNode;
  module: Module;
  requireWrite?: boolean;
}

/**
 * Guard for specific module access
 */
export function ModuleGuard({ children, module, requireWrite = false }: ModuleGuardProps) {
  return (
    <RBACAuthGuard requiredModule={module} requireWrite={requireWrite}>
      {children}
    </RBACAuthGuard>
  );
}

/**
 * Admin-only guard
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <RBACAuthGuard 
      allowedRoles={["ADMIN"]} 
      requiredModule="ADMIN_PANEL"
    >
      {children}
    </RBACAuthGuard>
  );
}

/**
 * Health Official guard
 */
export function HealthOfficialGuard({ children }: { children: React.ReactNode }) {
  return (
    <RBACAuthGuard allowedRoles={["HEALTH_OFFICIAL", "ADMIN"]}>
      {children}
    </RBACAuthGuard>
  );
}

/**
 * ASHA Worker guard
 */
export function AshaWorkerGuard({ children }: { children: React.ReactNode }) {
  return (
    <RBACAuthGuard allowedRoles={["ASHA_WORKER", "ADMIN"]}>
      {children}
    </RBACAuthGuard>
  );
}

/**
 * Field Worker guard
 */
export function FieldWorkerGuard({ children }: { children: React.ReactNode }) {
  return (
    <RBACAuthGuard allowedRoles={["FIELD_WORKER", "ADMIN"]}>
      {children}
    </RBACAuthGuard>
  );
}

/**
 * Education content creator guard (ASHA + Admin only)
 */
export function EducationWriterGuard({ children }: { children: React.ReactNode }) {
  return (
    <RBACAuthGuard 
      allowedRoles={["ASHA_WORKER", "ADMIN"]} 
      requiredModule="EDUCATION"
      requireWrite={true}
    >
      {children}
    </RBACAuthGuard>
  );
}

/**
 * Alert creator guard (Health Official + Admin only)
 */
export function AlertWriterGuard({ children }: { children: React.ReactNode }) {
  return (
    <RBACAuthGuard 
      allowedRoles={["HEALTH_OFFICIAL", "ADMIN"]} 
      requiredModule="ALERTS"
      requireWrite={true}
    >
      {children}
    </RBACAuthGuard>
  );
}

// Re-export for backwards compatibility
export { RBACAuthGuard as AuthGuard };
