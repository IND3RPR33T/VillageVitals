import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, password, role } = body;

    // Validate required fields
    if (!contact || !password || !role) {
      return NextResponse.json(
        { error: 'Contact, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if contact is email or phone
    const isEmail = contact.includes('@');
    let userEmail = contact;
    let userData: any = null;

    if (!isEmail) {
      // If phone number, find user by phone first
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', contact));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      userData = querySnapshot.docs[0].data();
      userEmail = userData.email;
    }

    // Sign in with Firebase Auth
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
    } catch (authError: any) {
      console.error('Firebase Auth error:', authError.code);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get user data from Firestore
    if (!userData) {
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        // Try by email
        const emailDoc = await getDoc(doc(db, 'users', userEmail.toLowerCase()));
        if (emailDoc.exists()) {
          userData = emailDoc.data();
        }
      } else {
        userData = userDoc.data();
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user is verified
    if (!userData.isVerified) {
      return NextResponse.json(
        { error: 'Please verify your account first. Check your email for the OTP code.' },
        { status: 401 }
      );
    }

    // Map role for comparison
    const roleMap: Record<string, string> = {
      'community': 'COMMUNITY_MEMBER',
      'health-worker': 'ASHA_WORKER',
      'asha_worker': 'ASHA_WORKER',
      'admin': 'ADMIN',
      'COMMUNITY_MEMBER': 'COMMUNITY_MEMBER',
      'ASHA_WORKER': 'ASHA_WORKER',
      'ADMIN': 'ADMIN',
      'HEALTH_OFFICIAL': 'HEALTH_OFFICIAL',
    };

    const normalizedInputRole = roleMap[role] || role;
    const normalizedUserRole = roleMap[userData.role] || userData.role;

    // Check if role matches (case-insensitive)
    if (normalizedInputRole.toUpperCase() !== normalizedUserRole.toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: userCredential.user.uid,
      email: userData.email,
      role: userData.role,
    });

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: userCredential.user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        isVerified: userData.isVerified,
      },
    });

    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
