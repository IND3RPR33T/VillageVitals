import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists in Firestore
    let userData: any = null;
    const userDoc = await getDoc(doc(db, 'users', email.toLowerCase()));
    
    if (userDoc.exists()) {
      userData = userDoc.data();
    } else {
      // Try finding by email field
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        userData = querySnapshot.docs[0].data();
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (userData.isVerified) {
      return NextResponse.json(
        { error: 'Account is already verified' },
        { status: 400 }
      );
    }

    // Generate and store new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await setDoc(doc(db, 'otps', email.toLowerCase()), {
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt,
      createdAt: serverTimestamp(),
      verified: false,
      attempts: 0,
    });

    const emailResult = await sendOTPEmail(email, otpCode, userData.firstName || 'User');
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP has been resent to your email',
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
