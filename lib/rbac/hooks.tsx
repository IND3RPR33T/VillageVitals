// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) - REACT HOOKS
// ============================================================
// React hooks for UI-level permission checking
// These hooks work with the centralized permission matrix

"use client";

import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { UserRole, Module, RBACUserProfile } from './types';
import { hasReadAccess, hasWriteAccess, getReadableModules, getWritableModules } from './permissions';
import { normalizeRole, DEFAULT_ROLE, getRoleDisplayName, getRoleColor, isAdmin } from './role-utils';
import { onAuthChange, getCurrentUserProfile } from '../firebase-auth';
import type { User } from 'firebase/auth';

// ============================================================
// RBAC CONTEXT
// ============================================================

interface RBACContextValue {
  user: RBACUserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Permission checks
  canRead: (module: Module) => boolean;
  canWrite: (module: Module) => boolean;
  
  // Role checks
  isAdmin: boolean;
  isHealthOfficial: boolean;
  isAshaWorker: boolean;
  isFieldWorker: boolean;
  
  // Role info
  roleDisplayName: string;
  roleColor: string;
  
  // Navigation
  accessibleModules: Module[];
  writableModules: Module[];
  
  // Refresh
  refreshRole: () => Promise<void>;
}

const defaultContext: RBACContextValue = {
  user: null,
  role: DEFAULT_ROLE,
  isLoading: true,
  isAuthenticated: false,
  canRead: () => false,
  canWrite: () => false,
  isAdmin: false,
  isHealthOfficial: false,
  isAshaWorker: false,
  isFieldWorker: false,
  roleDisplayName: 'Loading...',
  roleColor: '#6b7280',
  accessibleModules: [],
  writableModules: [],
  refreshRole: async () => {},
};

const RBACContext = createContext<RBACContextValue>(defaultContext);

// ============================================================
// RBAC PROVIDER
// ============================================================

interface RBACProviderProps {
  children: ReactNode;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const [user, setUser] = useState<RBACUserProfile | null>(null);
  const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        const normalizedRole = normalizeRole(profile.role);
        setUser({
          uid: profile.uid,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: normalizedRole,
          isVerified: profile.isVerified,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        });
        setRole(normalizedRole);
      } else {
        setUser(null);
        setRole(DEFAULT_ROLE);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUser(null);
      setRole(DEFAULT_ROLE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        await fetchUserRole();
      } else {
        setUser(null);
        setRole(DEFAULT_ROLE);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserRole]);

  // Memoized permission checks
  const canRead = useCallback((module: Module) => hasReadAccess(role, module), [role]);
  const canWrite = useCallback((module: Module) => hasWriteAccess(role, module), [role]);

  // Memoized role checks
  const roleChecks = useMemo(() => ({
    isAdmin: role === 'ADMIN',
    isHealthOfficial: role === 'HEALTH_OFFICIAL',
    isAshaWorker: role === 'ASHA_WORKER',
    isFieldWorker: role === 'FIELD_WORKER',
  }), [role]);

  // Memoized role info
  const roleInfo = useMemo(() => ({
    roleDisplayName: getRoleDisplayName(role),
    roleColor: getRoleColor(role),
  }), [role]);

  // Memoized accessible modules
  const modules = useMemo(() => ({
    accessibleModules: getReadableModules(role),
    writableModules: getWritableModules(role),
  }), [role]);

  const value: RBACContextValue = {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
    canRead,
    canWrite,
    ...roleChecks,
    ...roleInfo,
    ...modules,
    refreshRole: fetchUserRole,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Main hook for accessing RBAC context
 */
export function useRBAC(): RBACContextValue {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}

/**
 * Hook for checking if user can access a module
 */
export function useCanRead(module: Module): boolean {
  const { canRead, isLoading } = useRBAC();
  return !isLoading && canRead(module);
}

/**
 * Hook for checking if user can write to a module
 */
export function useCanWrite(module: Module): boolean {
  const { canWrite, isLoading } = useRBAC();
  return !isLoading && canWrite(module);
}

/**
 * Hook for checking if user is admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin, isLoading } = useRBAC();
  return !isLoading && isAdmin;
}

/**
 * Hook for getting user role
 */
export function useUserRole(): UserRole {
  const { role } = useRBAC();
  return role;
}

/**
 * Hook for checking if user has any of the specified roles
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { role, isLoading } = useRBAC();
  return !isLoading && allowedRoles.includes(role);
}

/**
 * Hook for module-specific permissions
 */
export function useModulePermissions(module: Module): {
  canRead: boolean;
  canWrite: boolean;
  isLoading: boolean;
} {
  const { canRead, canWrite, isLoading } = useRBAC();
  
  return useMemo(() => ({
    canRead: canRead(module),
    canWrite: canWrite(module),
    isLoading,
  }), [canRead, canWrite, module, isLoading]);
}

// ============================================================
// PERMISSION-GATED COMPONENTS
// ============================================================

interface PermissionGateProps {
  children: ReactNode;
  module: Module;
  permission: 'read' | 'write';
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has permission
 */
export function PermissionGate({ 
  children, 
  module, 
  permission, 
  fallback = null 
}: PermissionGateProps) {
  const { canRead, canWrite, isLoading } = useRBAC();

  if (isLoading) {
    return null;
  }

  const hasPermission = permission === 'read' 
    ? canRead(module) 
    : canWrite(module);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has one of the allowed roles
 */
export function RoleGate({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGateProps) {
  const { role, isLoading } = useRBAC();

  if (isLoading) {
    return null;
  }

  return allowedRoles.includes(role) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component that only renders for admin users
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode 
}) {
  return (
    <RoleGate allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * Component that renders a write button only if user has write permission
 */
interface WriteButtonProps {
  module: Module;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function WriteButton({ 
  module, 
  onClick, 
  children, 
  className = '',
  disabled = false
}: WriteButtonProps) {
  const canWrite = useCanWrite(module);

  if (!canWrite) {
    return null;
  }

  return (
    <button 
      onClick={onClick} 
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
