import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, query, collection, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['COMMUNITY_MEMBER', 'ASHA_WORKER', 'ADMIN', 'HEALTH_OFFICIAL', 'community', 'health-worker', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    // Map role to Firebase format
    const roleMap: Record<string, string> = {
      'community': 'COMMUNITY_MEMBER',
      'health-worker': 'ASHA_WORKER',
      'admin': 'ADMIN',
      'COMMUNITY_MEMBER': 'COMMUNITY_MEMBER',
      'ASHA_WORKER': 'ASHA_WORKER',
      'ADMIN': 'ADMIN',
      'HEALTH_OFFICIAL': 'HEALTH_OFFICIAL',
    };
    const normalizedRole = roleMap[role] || 'COMMUNITY_MEMBER';

    // Check if phone number is already used by another user
    const usersRef = collection(db, 'users');
    const phoneQuery = query(usersRef, where('phone', '==', phone));
    const phoneSnapshot = await getDocs(phoneQuery);
    
    const otherUserWithPhone = phoneSnapshot.docs.find(doc => 
      doc.id !== payload.userId && doc.data().uid !== payload.userId
    );
    
    if (otherUserWithPhone) {
      return NextResponse.json(
        { error: 'Phone number is already in use by another account' },
        { status: 409 }
      );
    }

    // Get user document
    const userDocRef = doc(db, 'users', payload.userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    await updateDoc(userDocRef, {
      firstName,
      lastName,
      phone,
      role: normalizedRole,
      updatedAt: serverTimestamp(),
    });

    const userData = userDoc.data();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: payload.userId,
        firstName,
        lastName,
        email: userData.email,
        phone,
        role: normalizedRole,
        isVerified: userData.isVerified,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
