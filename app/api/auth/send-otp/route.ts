import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendOTPEmail } from '@/lib/email';

// Generate a random 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP in Firestore
        const otpDocRef = doc(db, 'otps', email.toLowerCase());
        await setDoc(otpDocRef, {
            email: email.toLowerCase(),
            otp: otpCode,
            expiresAt: expiresAt,
            createdAt: serverTimestamp(),
            verified: false,
            attempts: 0,
        });

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otpCode, name || 'User');

        if (emailResult.success) {
            return NextResponse.json({
                success: true,
                message: 'OTP sent successfully. Please check your email.',
            });
        } else {
            console.error('Failed to send OTP email:', emailResult.error);
            return NextResponse.json(
                { success: false, error: 'Failed to send OTP email. Please try again.' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in send-otp:', error);
        return NextResponse.json(
            { success: false, error: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
