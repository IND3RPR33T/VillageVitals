// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) - TYPE DEFINITIONS
// ============================================================
// This file defines all types for the RBAC system.
// These are the SINGLE SOURCE OF TRUTH for roles and permissions.

/**
 * User Roles - Fixed, no new roles allowed
 * These are the only valid roles in the system.
 */
export type UserRole = 
  | 'ASHA_WORKER' 
  | 'FIELD_WORKER' 
  | 'HEALTH_OFFICIAL' 
  | 'ADMIN'
  | 'USER'; // Normal users (read-only, no role-based write permissions)

/**
 * Permission Types
 */
export type Permission = 'READ' | 'WRITE' | 'NONE';

/**
 * System Modules/Pages
 */
export type Module = 
  | 'DASHBOARD'
  | 'HEALTH_REPORTS'
  | 'WATER_QUALITY'
  | 'HEALTH_MAPS'
  | 'ALERTS'
  | 'EDUCATION' 
  | 'COMMUNITY'
  | 'REPORTS'
  | 'ADMIN_PANEL'
  | 'USER_SETTINGS'
  | 'SYSTEM_SETTINGS';

/**
 * Permission Set for a module
 */
export interface ModulePermission {
  read: boolean;
  write: boolean;
}

/**
 * Complete permission matrix for a role
 */
export type RolePermissions = Record<Module, ModulePermission>;

/**
 * User profile with role information
 */
export interface RBACUserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

/**
 * Document metadata for RBAC enforcement
 */
export interface RBACDocumentMetadata {
  createdBy: string;
  createdByRole: UserRole;
  createdAt: Date;
  updatedBy?: string;
  updatedByRole?: UserRole;
  updatedAt?: Date;
}

/**
 * API Response for unauthorized access
 */
export interface UnauthorizedResponse {
  success: false;
  error: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_ROLE';
  requiredRole?: UserRole[];
  requiredPermission?: Permission;
}

/**
 * Legacy role mapping - maps old role names to new standardized ones
 */
export const LEGACY_ROLE_MAPPING: Record<string, UserRole> = {
  // Old web app roles
  'admin': 'ADMIN',
  'health_official': 'HEALTH_OFFICIAL',
  'asha_worker': 'ASHA_WORKER',
  'field_worker': 'FIELD_WORKER',
  'community': 'USER',
  'community_user': 'USER',
  
  // Old mobile app roles
  'healthWorker': 'HEALTH_OFFICIAL',
  'health_worker': 'HEALTH_OFFICIAL',
  'communityUser': 'USER',
  
  // Already standardized
  'ADMIN': 'ADMIN',
  'HEALTH_OFFICIAL': 'HEALTH_OFFICIAL',
  'ASHA_WORKER': 'ASHA_WORKER',
  'FIELD_WORKER': 'FIELD_WORKER',
  'USER': 'USER',
};

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  HEALTH_OFFICIAL: 'Health Official',
  ASHA_WORKER: 'ASHA Worker',
  FIELD_WORKER: 'Field Worker',
  USER: 'Community Member',
};

/**
 * Role colors for UI badges
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: '#dc2626',        // Red
  HEALTH_OFFICIAL: '#2563eb', // Blue
  ASHA_WORKER: '#16a34a',    // Green
  FIELD_WORKER: '#f59e0b',   // Orange
  USER: '#6b7280',           // Gray
};
