import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, query, collection, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, name } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get OTP from Firestore
    const otpDocRef = doc(db, 'otps', email.toLowerCase());
    const otpDoc = await getDoc(otpDocRef);

    if (!otpDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'No OTP found. Please request a new one.' },
        { status: 404 }
      );
    }

    const otpData = otpDoc.data();

    // Check if already verified
    if (otpData.verified) {
      return NextResponse.json(
        { success: false, error: 'OTP already used. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if expired
    const expiresAt = otpData.expiresAt?.toDate ? otpData.expiresAt.toDate() : new Date(otpData.expiresAt);
    if (new Date() > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts limit (max 5 attempts)
    if (otpData.attempts >= 5) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      // Increment attempts
      await updateDoc(otpDocRef, {
        attempts: otpData.attempts + 1,
      });
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - mark as verified
    await updateDoc(otpDocRef, {
      verified: true,
      verifiedAt: serverTimestamp(),
    });

    // Update user's isVerified status in Firestore
    // Try finding user by email document ID first
    const userDocRef = doc(db, 'users', email.toLowerCase());
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        isVerified: true,
        isActive: true,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Also update by UID if available
      const userData = userDoc.data();
      if (userData.uid) {
        const uidDocRef = doc(db, 'users', userData.uid);
        const uidDoc = await getDoc(uidDocRef);
        if (uidDoc.exists()) {
          await updateDoc(uidDocRef, {
            isVerified: true,
            isActive: true,
            verifiedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } else {
      // Try finding by email field
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      for (const userDocSnap of querySnapshot.docs) {
        await updateDoc(userDocSnap.ref, {
          isVerified: true,
          isActive: true,
          verifiedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Send welcome email
    if (name) {
      await sendWelcomeEmail(email, name);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully!',
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
