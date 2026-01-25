// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) - API MIDDLEWARE
// ============================================================
// Middleware functions for API route protection
// CRITICAL: Every API endpoint MUST use these functions

import { NextRequest, NextResponse } from 'next/server';
import { UserRole, Module, UnauthorizedResponse } from './types';
import { hasReadAccess, hasWriteAccess, canWriteToCollection } from './permissions';
import { normalizeRole } from './role-utils';
import { verifyToken, JWTPayload } from '../auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// ============================================================
// ERROR RESPONSES
// ============================================================

function createUnauthorizedResponse(
  message: string,
  code: UnauthorizedResponse['code'] = 'UNAUTHORIZED',
  requiredRole?: UserRole[],
  requiredPermission?: 'READ' | 'WRITE'
): NextResponse<UnauthorizedResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      requiredRole,
      requiredPermission,
    },
    { status: code === 'UNAUTHORIZED' ? 401 : 403 }
  );
}

// ============================================================
// TOKEN EXTRACTION
// ============================================================

/**
 * Extract JWT token from request headers
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

/**
 * Verify and decode JWT token
 */
export function verifyAndDecodeToken(token: string): JWTPayload | null {
  return verifyToken(token);
}

// ============================================================
// ROLE EXTRACTION FROM FIREBASE
// ============================================================

/**
 * Get user role from Firestore by user ID
 */
export async function getUserRoleFromFirestore(userId: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const role = userDoc.data()?.role as string;
      return normalizeRole(role);
    }
    return 'USER';
  } catch (error) {
    console.error('Error fetching user role from Firestore:', error);
    return 'USER';
  }
}

// ============================================================
// API PROTECTION MIDDLEWARE
// ============================================================

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
  userRole?: UserRole;
}

/**
 * Verify that user is authenticated
 * Returns user info if authenticated, null otherwise
 */
export async function verifyAuthentication(
  request: NextRequest
): Promise<{ user: JWTPayload; role: UserRole } | null> {
  const token = extractToken(request);
  if (!token) {
    return null;
  }

  const decoded = verifyAndDecodeToken(token);
  if (!decoded) {
    return null;
  }

  // Get role from token or Firestore
  let role: UserRole;
  if (decoded.role) {
    role = normalizeRole(decoded.role);
  } else {
    role = await getUserRoleFromFirestore(decoded.userId.toString());
  }

  return { user: decoded, role };
}

/**
 * Require authentication for an API route
 * Returns error response if not authenticated
 */
export async function requireAuthentication(
  request: NextRequest
): Promise<NextResponse<UnauthorizedResponse> | { user: JWTPayload; role: UserRole }> {
  const auth = await verifyAuthentication(request);
  
  if (!auth) {
    return createUnauthorizedResponse(
      'Authentication required',
      'UNAUTHORIZED'
    );
  }

  return auth;
}

/**
 * Require a specific role for an API route
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<NextResponse<UnauthorizedResponse> | { user: JWTPayload; role: UserRole }> {
  const auth = await requireAuthentication(request);
  
  if (auth instanceof NextResponse) {
    return auth; // Already an error response
  }

  if (!allowedRoles.includes(auth.role)) {
    return createUnauthorizedResponse(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      'FORBIDDEN',
      allowedRoles
    );
  }

  return auth;
}

/**
 * Require read access to a module
 */
export async function requireReadAccess(
  request: NextRequest,
  module: Module
): Promise<NextResponse<UnauthorizedResponse> | { user: JWTPayload; role: UserRole }> {
  const auth = await requireAuthentication(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!hasReadAccess(auth.role, module)) {
    return createUnauthorizedResponse(
      `Read access denied for module: ${module}`,
      'FORBIDDEN',
      undefined,
      'READ'
    );
  }

  return auth;
}

/**
 * Require write access to a module
 */
export async function requireWriteAccess(
  request: NextRequest,
  module: Module
): Promise<NextResponse<UnauthorizedResponse> | { user: JWTPayload; role: UserRole }> {
  const auth = await requireAuthentication(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!hasWriteAccess(auth.role, module)) {
    return createUnauthorizedResponse(
      `Write access denied for module: ${module}`,
      'FORBIDDEN',
      undefined,
      'WRITE'
    );
  }

  return auth;
}

/**
 * Require write access to a Firestore collection
 */
export async function requireCollectionWriteAccess(
  request: NextRequest,
  collection: string
): Promise<NextResponse<UnauthorizedResponse> | { user: JWTPayload; role: UserRole }> {
  const auth = await requireAuthentication(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!canWriteToCollection(auth.role, collection)) {
    return createUnauthorizedResponse(
      `Write access denied for collection: ${collection}`,
      'FORBIDDEN',
      undefined,
      'WRITE'
    );
  }

  return auth;
}

/**
 * Require admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse<UnauthorizedResponse> | { user: JWTPayload; role: UserRole }> {
  return requireRole(request, ['ADMIN']);
}

// ============================================================
// ROUTE HELPERS
// ============================================================

/**
 * Create a protected API handler that requires authentication
 */
export function withAuth<T>(
  handler: (
    request: NextRequest,
    auth: { user: JWTPayload; role: UserRole }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | UnauthorizedResponse>> => {
    const auth = await requireAuthentication(request);
    
    if (auth instanceof NextResponse) {
      return auth;
    }

    return handler(request, auth);
  };
}

/**
 * Create a protected API handler that requires specific roles
 */
export function withRoles<T>(
  allowedRoles: UserRole[],
  handler: (
    request: NextRequest,
    auth: { user: JWTPayload; role: UserRole }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | UnauthorizedResponse>> => {
    const auth = await requireRole(request, allowedRoles);
    
    if (auth instanceof NextResponse) {
      return auth;
    }

    return handler(request, auth);
  };
}

/**
 * Create a protected API handler that requires module read access
 */
export function withReadAccess<T>(
  module: Module,
  handler: (
    request: NextRequest,
    auth: { user: JWTPayload; role: UserRole }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | UnauthorizedResponse>> => {
    const auth = await requireReadAccess(request, module);
    
    if (auth instanceof NextResponse) {
      return auth;
    }

    return handler(request, auth);
  };
}

/**
 * Create a protected API handler that requires module write access
 */
export function withWriteAccess<T>(
  module: Module,
  handler: (
    request: NextRequest,
    auth: { user: JWTPayload; role: UserRole }
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | UnauthorizedResponse>> => {
    const auth = await requireWriteAccess(request, module);
    
    if (auth instanceof NextResponse) {
      return auth;
    }

    return handler(request, auth);
  };
}

/**
 * Create a protected API handler that requires admin access
 */
export function withAdmin<T>(
  handler: (
    request: NextRequest,
    auth: { user: JWTPayload; role: UserRole }
  ) => Promise<NextResponse<T>>
) {
  return withRoles(['ADMIN'], handler);
}

// ============================================================
// DOCUMENT-LEVEL AUTHORIZATION
// ============================================================

/**
 * Check if user can edit a document based on ownership
 * Normal users can only edit their own documents
 * Elevated roles may have broader access
 */
export function canEditDocument(
  userRole: UserRole,
  userId: string,
  documentOwnerId: string,
  module: Module
): boolean {
  // Check if role has write access to module
  if (!hasWriteAccess(userRole, module)) {
    return false;
  }

  // Admin can edit any document
  if (userRole === 'ADMIN') {
    return true;
  }

  // For USER_SETTINGS, only own profile
  if (module === 'USER_SETTINGS') {
    return userId === documentOwnerId;
  }

  // For most modules, if user has write access, they can edit
  return true;
}

/**
 * Check if user can delete a document
 * Only ADMIN can delete most documents
 */
export function canDeleteDocument(
  userRole: UserRole,
  userId: string,
  documentOwnerId: string,
  module: Module
): boolean {
  // Only admin can delete
  if (userRole === 'ADMIN') {
    return true;
  }

  // Users can delete their own data in USER_SETTINGS
  if (module === 'USER_SETTINGS' && userId === documentOwnerId) {
    return true;
  }

  return false;
}
