// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) - PERMISSION MATRIX
// ============================================================
// This file contains the AUTHORITATIVE permission matrix.
// All permission checks MUST reference this file.
// DO NOT modify permissions without authorization.

import { UserRole, Module, ModulePermission, RolePermissions } from './types';

/**
 * AUTHORITATIVE PERMISSION MATRIX
 * 
 * This is the SINGLE SOURCE OF TRUTH for all permissions.
 * If a feature conflicts with these rules, these rules WIN.
 * 
 * Legend:
 * - READ: Can view/access the module
 * - WRITE: Can create/edit/delete in the module
 * - NONE: No access at all
 */

// Helper to create permission objects
const perm = (read: boolean, write: boolean): ModulePermission => ({ read, write });

// ============================================================
// ASHA WORKER PERMISSIONS
// ============================================================
const ASHA_WORKER_PERMISSIONS: RolePermissions = {
  DASHBOARD: perm(true, false),      // READ only
  HEALTH_REPORTS: perm(true, true),  // READ + WRITE
  WATER_QUALITY: perm(true, false),  // READ only
  HEALTH_MAP: perm(true, false),     // READ only (auto-generated)
  ALERTS: perm(true, false),         // READ only
  EDUCATION: perm(true, true),       // READ + WRITE (CRITICAL: ASHA workers CAN publish)
  COMMUNITY: perm(true, true),       // READ + WRITE (can post community updates)
  REPORTS: perm(true, false),        // READ only
  ADMIN_PANEL: perm(false, false),   // NO ACCESS
  USER_SETTINGS: perm(true, true),   // Own profile only
  SYSTEM_SETTINGS: perm(false, false), // NO ACCESS
};

// ============================================================
// FIELD WORKER PERMISSIONS
// ============================================================
const FIELD_WORKER_PERMISSIONS: RolePermissions = {
  DASHBOARD: perm(true, false),      // READ only
  HEALTH_REPORTS: perm(true, true),  // READ + WRITE
  WATER_QUALITY: perm(true, true),   // READ + WRITE
  HEALTH_MAP: perm(true, false),     // READ only (auto-generated)
  ALERTS: perm(true, false),         // READ only
  EDUCATION: perm(true, false),      // READ only (CANNOT publish awareness content)
  COMMUNITY: perm(true, false),      // READ only
  REPORTS: perm(true, false),        // READ only
  ADMIN_PANEL: perm(false, false),   // NO ACCESS
  USER_SETTINGS: perm(true, true),   // Own profile only
  SYSTEM_SETTINGS: perm(false, false), // NO ACCESS
};

// ============================================================
// HEALTH OFFICIAL PERMISSIONS
// ============================================================
const HEALTH_OFFICIAL_PERMISSIONS: RolePermissions = {
  DASHBOARD: perm(true, false),      // READ only
  HEALTH_REPORTS: perm(true, false), // READ only
  WATER_QUALITY: perm(true, false),  // READ only
  HEALTH_MAP: perm(true, false),     // READ only (auto-generated)
  ALERTS: perm(true, true),          // READ + WRITE (can create/manage alerts)
  EDUCATION: perm(true, false),      // READ only (CANNOT publish awareness content)
  COMMUNITY: perm(true, true),       // READ + WRITE (can post official announcements)
  REPORTS: perm(true, false),        // READ only
  ADMIN_PANEL: perm(false, false),   // NO ACCESS
  USER_SETTINGS: perm(true, true),   // Own profile only
  SYSTEM_SETTINGS: perm(false, false), // NO ACCESS
};

// ============================================================
// ADMIN PERMISSIONS
// ============================================================
const ADMIN_PERMISSIONS: RolePermissions = {
  DASHBOARD: perm(true, false),      // READ only (dashboard is view-only for all)
  HEALTH_REPORTS: perm(true, true),  // READ + WRITE
  WATER_QUALITY: perm(true, true),   // READ + WRITE
  HEALTH_MAP: perm(true, false),     // READ only (auto-generated, no manual edits)
  ALERTS: perm(true, true),          // READ + WRITE
  EDUCATION: perm(true, true),       // READ + WRITE
  COMMUNITY: perm(true, true),       // READ + WRITE (full community management)
  REPORTS: perm(true, true),         // READ + WRITE (only admin can generate/export)
  ADMIN_PANEL: perm(true, true),     // FULL ACCESS
  USER_SETTINGS: perm(true, true),   // Own profile
  SYSTEM_SETTINGS: perm(true, true), // FULL ACCESS
};

// ============================================================
// NORMAL USER PERMISSIONS (Read-only, no role-based writes)
// ============================================================
const USER_PERMISSIONS: RolePermissions = {
  DASHBOARD: perm(true, false),      // READ only
  HEALTH_REPORTS: perm(true, false), // READ only
  WATER_QUALITY: perm(true, false),  // READ only
  HEALTH_MAP: perm(true, false),     // READ only
  ALERTS: perm(true, false),         // READ only
  EDUCATION: perm(true, false),      // READ only (CANNOT publish)
  COMMUNITY: perm(true, false),      // READ only
  REPORTS: perm(true, false),        // READ only
  ADMIN_PANEL: perm(false, false),   // NO ACCESS
  USER_SETTINGS: perm(true, true),   // Own profile only
  SYSTEM_SETTINGS: perm(false, false), // NO ACCESS
};

// ============================================================
// MASTER PERMISSION MATRIX
// ============================================================
export const PERMISSION_MATRIX: Record<UserRole, RolePermissions> = {
  ASHA_WORKER: ASHA_WORKER_PERMISSIONS,
  FIELD_WORKER: FIELD_WORKER_PERMISSIONS,
  HEALTH_OFFICIAL: HEALTH_OFFICIAL_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  USER: USER_PERMISSIONS,
};

// ============================================================
// COLLECTION-LEVEL WRITE PERMISSIONS (for Firestore rules)
// ============================================================
export const COLLECTION_WRITE_PERMISSIONS: Record<string, UserRole[]> = {
  // Health Reports: ASHA_WORKER, FIELD_WORKER, ADMIN
  'health_reports': ['ASHA_WORKER', 'FIELD_WORKER', 'ADMIN'],
  'symptom_reports': ['ASHA_WORKER', 'FIELD_WORKER', 'ADMIN'],
  
  // Water Quality: FIELD_WORKER, ADMIN
  'water_quality_tests': ['FIELD_WORKER', 'ADMIN'],
  'water_sources': ['FIELD_WORKER', 'ADMIN'],
  
  // Alerts: HEALTH_OFFICIAL, ADMIN
  'alerts': ['HEALTH_OFFICIAL', 'ADMIN'],
  'emergency_alerts': ['HEALTH_OFFICIAL', 'ADMIN'],
  
  // Education/Awareness: ASHA_WORKER, ADMIN (CRITICAL)
  'awareness_content': ['ASHA_WORKER', 'ADMIN'],
  'education': ['ASHA_WORKER', 'ADMIN'],
  
  // Reports (exports): ADMIN only
  'exported_reports': ['ADMIN'],
  'analytics': ['ADMIN'],
  
  // System: ADMIN only
  'system_settings': ['ADMIN'],
  'system_logs': ['ADMIN'],
  
  // Users: ADMIN only (for role changes)
  'users': ['ADMIN'],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a role has read access to a module
 */
export function hasReadAccess(role: UserRole, module: Module): boolean {
  return PERMISSION_MATRIX[role]?.[module]?.read ?? false;
}

/**
 * Check if a role has write access to a module
 */
export function hasWriteAccess(role: UserRole, module: Module): boolean {
  return PERMISSION_MATRIX[role]?.[module]?.write ?? false;
}

/**
 * Check if a role can write to a Firestore collection
 */
export function canWriteToCollection(role: UserRole, collection: string): boolean {
  const allowedRoles = COLLECTION_WRITE_PERMISSIONS[collection];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Get all modules a role can read
 */
export function getReadableModules(role: UserRole): Module[] {
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return [];
  
  return (Object.entries(permissions) as [Module, ModulePermission][])
    .filter(([_, perm]) => perm.read)
    .map(([module, _]) => module);
}

/**
 * Get all modules a role can write to
 */
export function getWritableModules(role: UserRole): Module[] {
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return [];
  
  return (Object.entries(permissions) as [Module, ModulePermission][])
    .filter(([_, perm]) => perm.write)
    .map(([module, _]) => module);
}

/**
 * Get roles that can write to a specific module
 */
export function getRolesWithWriteAccess(module: Module): UserRole[] {
  const roles: UserRole[] = ['ASHA_WORKER', 'FIELD_WORKER', 'HEALTH_OFFICIAL', 'ADMIN', 'USER'];
  return roles.filter(role => hasWriteAccess(role, module));
}

/**
 * Get roles that can read a specific module
 */
export function getRolesWithReadAccess(module: Module): UserRole[] {
  const roles: UserRole[] = ['ASHA_WORKER', 'FIELD_WORKER', 'HEALTH_OFFICIAL', 'ADMIN', 'USER'];
  return roles.filter(role => hasReadAccess(role, module));
}
