import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Get user from Firestore by UID
    let userData: any = null;
    const userDoc = await getDoc(doc(db, 'users', payload.userId));
    
    if (userDoc.exists()) {
      userData = userDoc.data();
    } else if (payload.email) {
      // Try by email
      const emailDoc = await getDoc(doc(db, 'users', payload.email.toLowerCase()));
      if (emailDoc.exists()) {
        userData = emailDoc.data();
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        isVerified: userData.isVerified,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
