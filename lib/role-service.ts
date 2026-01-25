// Role-Based Access Control Service for Village Vital Web App
// Provides role checking and permission management
// Updated to match Flutter app roles

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

// User roles - matches Flutter app
export type UserRole = 'admin' | 'health_official' | 'asha_worker' | 'field_worker';

export interface UserRoleData {
    role: UserRole;
    roleCreatedAt?: Date;
    roleUpdatedAt?: Date;
    roleUpdatedBy?: string;
}

// Default role for new users
export const DEFAULT_ROLE: UserRole = 'field_worker';

// ============== GET USER ROLE ==============

export async function getCurrentUserRole(): Promise<UserRole> {
    try {
        const user = auth.currentUser;
        if (!user) return DEFAULT_ROLE;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const role = userDoc.data()?.role as UserRole;
            // Handle legacy roles
            if (role === 'community_user' as any || role === 'community' as any) return 'field_worker';
            if (role === 'health_worker' as any || role === 'health-worker' as any) return 'health_official';
            return role || DEFAULT_ROLE;
        }

        return DEFAULT_ROLE;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return DEFAULT_ROLE;
    }
}

export async function getUserRole(userId: string): Promise<UserRole> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const role = userDoc.data()?.role as UserRole;
            // Handle legacy roles
            if (role === 'community_user' as any || role === 'community' as any) return 'field_worker';
            if (role === 'health_worker' as any || role === 'health-worker' as any) return 'health_official';
            return role || DEFAULT_ROLE;
        }
        return DEFAULT_ROLE;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return DEFAULT_ROLE;
    }
}

// ============== SET USER ROLE (Admin only) ==============

export async function setUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('No user authenticated');
            return false;
        }

        // Check if current user is admin
        const currentRole = await getCurrentUserRole();
        if (currentRole !== 'admin') {
            console.error('Only admins can change user roles');
            return false;
        }

        await updateDoc(doc(db, 'users', userId), {
            role: newRole,
            roleUpdatedAt: serverTimestamp(),
            roleUpdatedBy: currentUser.uid,
        });

        console.log(`User ${userId} role updated to ${newRole}`);
        return true;
    } catch (error) {
        console.error('Error setting user role:', error);
        return false;
    }
}

// ============== PERMISSION CHECKS ==============

// Can view all reports (not just their own)
export function canViewAllReports(role: UserRole | string): boolean {
    return role === 'admin' || role === 'health_official' || role === 'asha_worker';
}

// Can view all water tests
export function canViewAllWaterTests(role: UserRole | string): boolean {
    return role === 'admin' || role === 'health_official' || role === 'asha_worker';
}

// Can view all emergency alerts
export function canViewAllAlerts(role: UserRole | string): boolean {
    return role === 'admin' || role === 'health_official' || role === 'asha_worker';
}

// Can manage other users (roles, access)
export function canManageUsers(role: UserRole | string): boolean {
    return role === 'admin';
}

// Can create/edit awareness content
export function canManageAwarenessContent(role: UserRole | string): boolean {
    return role === 'admin';
}

// Can delete any data
export function canDeleteData(role: UserRole | string): boolean {
    return role === 'admin';
}

// Can export all data
export function canExportAllData(role: UserRole | string): boolean {
    return role === 'admin' || role === 'health_official';
}

// Can access admin panel
export function canAccessAdminPanel(role: UserRole | string): boolean {
    return role === 'admin';
}

// Can view analytics/statistics
export function canViewAnalytics(role: UserRole | string): boolean {
    return role === 'admin' || role === 'health_official' || role === 'asha_worker';
}

// ============== ROLE DISPLAY ==============

export function getRoleDisplayName(role: UserRole | string): string {
    switch (role) {
        case 'admin':
            return 'Administrator';
        case 'health_official':
            return 'Health Official';
        case 'asha_worker':
            return 'ASHA Worker';
        case 'field_worker':
            return 'Field Worker';
        // Legacy roles
        case 'health_worker':
        case 'health-worker':
            return 'Health Worker';
        case 'community_user':
        case 'community':
            return 'Community Member';
        default:
            return 'Unknown';
    }
}

export function getRoleColor(role: UserRole | string): string {
    switch (role) {
        case 'admin':
            return '#dc2626'; // Red
        case 'health_official':
            return '#2563eb'; // Blue
        case 'asha_worker':
            return '#16a34a'; // Green
        case 'field_worker':
            return '#f59e0b'; // Orange
        default:
            return '#6b7280'; // Gray
    }
}

// ============== ROLE-BASED DATA FILTERING ==============

// Get filter for queries based on role
// Returns userId if user can only see their own data, null if can see all
export function getDataFilter(role: UserRole | string, userId: string): string | null {
    if (canViewAllReports(role)) {
        return null; // No filter - can see all data
    }
    return userId; // Filter by user ID - can only see own data
}
