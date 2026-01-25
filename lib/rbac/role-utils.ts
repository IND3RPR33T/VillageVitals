// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) - ROLE UTILITIES
// ============================================================
// Utility functions for role management and validation

import { UserRole, LEGACY_ROLE_MAPPING, ROLE_DISPLAY_NAMES, ROLE_COLORS } from './types';

/**
 * Valid roles that can be assigned
 */
export const VALID_ROLES: UserRole[] = [
  'ASHA_WORKER',
  'FIELD_WORKER', 
  'HEALTH_OFFICIAL',
  'ADMIN',
  'USER'
];

/**
 * Default role for new users
 */
export const DEFAULT_ROLE: UserRole = 'USER';

/**
 * Normalize a role string to the standard UserRole type
 * Handles legacy role names from both web and mobile apps
 */
export function normalizeRole(roleString: string | null | undefined): UserRole {
  if (!roleString) return DEFAULT_ROLE;
  
  // Check if it's already a valid role
  if (VALID_ROLES.includes(roleString as UserRole)) {
    return roleString as UserRole;
  }
  
  // Check legacy mapping
  const normalized = LEGACY_ROLE_MAPPING[roleString];
  if (normalized) {
    return normalized;
  }
  
  // Try case-insensitive match
  const upperRole = roleString.toUpperCase().replace(/-/g, '_');
  if (VALID_ROLES.includes(upperRole as UserRole)) {
    return upperRole as UserRole;
  }
  
  // Default fallback
  console.warn(`Unknown role "${roleString}", defaulting to USER`);
  return DEFAULT_ROLE;
}

/**
 * Check if a role string is valid
 */
export function isValidRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return VALID_ROLES.includes(role as UserRole) || 
         Object.keys(LEGACY_ROLE_MAPPING).includes(role);
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole | string): string {
  const normalizedRole = normalizeRole(role);
  return ROLE_DISPLAY_NAMES[normalizedRole] || 'Unknown';
}

/**
 * Get color for a role (for UI badges)
 */
export function getRoleColor(role: UserRole | string): string {
  const normalizedRole = normalizeRole(role);
  return ROLE_COLORS[normalizedRole] || '#6b7280';
}

/**
 * Check if a role is an admin role
 */
export function isAdmin(role: UserRole | string): boolean {
  return normalizeRole(role) === 'ADMIN';
}

/**
 * Check if a role is a health official
 */
export function isHealthOfficial(role: UserRole | string): boolean {
  return normalizeRole(role) === 'HEALTH_OFFICIAL';
}

/**
 * Check if a role is an ASHA worker
 */
export function isAshaWorker(role: UserRole | string): boolean {
  return normalizeRole(role) === 'ASHA_WORKER';
}

/**
 * Check if a role is a field worker
 */
export function isFieldWorker(role: UserRole | string): boolean {
  return normalizeRole(role) === 'FIELD_WORKER';
}

/**
 * Check if a role is a normal user (non-worker)
 */
export function isNormalUser(role: UserRole | string): boolean {
  return normalizeRole(role) === 'USER';
}

/**
 * Check if a role has any elevated permissions (not a normal user)
 */
export function hasElevatedPermissions(role: UserRole | string): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole !== 'USER';
}

/**
 * Get role hierarchy level (for comparison)
 * Higher number = more permissions
 */
export function getRoleLevel(role: UserRole | string): number {
  const normalizedRole = normalizeRole(role);
  switch (normalizedRole) {
    case 'ADMIN': return 100;
    case 'HEALTH_OFFICIAL': return 75;
    case 'ASHA_WORKER': return 50;
    case 'FIELD_WORKER': return 50;
    case 'USER': return 0;
    default: return 0;
  }
}

/**
 * Check if role1 has higher or equal privileges than role2
 */
export function hasHigherOrEqualRole(role1: UserRole | string, role2: UserRole | string): boolean {
  return getRoleLevel(role1) >= getRoleLevel(role2);
}

/**
 * Convert role to lowercase for database storage (backwards compatibility)
 */
export function roleToDbFormat(role: UserRole): string {
  return role.toLowerCase().replace(/_/g, '_');
}

/**
 * Convert role from database format to UserRole
 */
export function roleFromDbFormat(dbRole: string): UserRole {
  return normalizeRole(dbRole);
}
