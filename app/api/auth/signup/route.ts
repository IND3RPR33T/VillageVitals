import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Map role to Firebase format
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
    
    const normalizedRole = roleMap[role] || 'COMMUNITY_MEMBER';

    // Check if user already exists in Firestore
    const userDocRef = doc(db, 'users', email.toLowerCase());
    const existingUser = await getDoc(userDocRef);
    
    if (existingUser.exists()) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user with Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      console.error('Firebase Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    // Create user document in Firestore
    await setDoc(userDocRef, {
      uid: userCredential.user.uid,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      role: normalizedRole,
      isVerified: false,
      isActive: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Also store user by UID for role lookups
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      role: normalizedRole,
      isVerified: false,
      isActive: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Generate and store OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await setDoc(doc(db, 'otps', email.toLowerCase()), {
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt,
      createdAt: serverTimestamp(),
      verified: false,
      attempts: 0,
      type: 'email_verification',
    });

    // Send OTP email
    await sendOTPEmail(email, otpCode, firstName);
    console.log('User registered, OTP sent:', email);

    return NextResponse.json({
      message: 'Registration successful! Please check your email for OTP verification.',
      userId: userCredential.user.uid,
      email: email.toLowerCase(),
      requiresOTPVerification: true,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
