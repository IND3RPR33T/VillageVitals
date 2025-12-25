import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, verifyUser } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otpCode } = body;

    // Validate required fields
    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(email, otpCode);
    
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }

    // Verify user in database
    const verifiedUser = await verifyUser(email);
    
    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send welcome email
    await sendWelcomeEmail(email, verifiedUser.first_name);

    return NextResponse.json({
      message: 'Account verified successfully',
      user: {
        id: verifiedUser.id,
        firstName: verifiedUser.first_name,
        lastName: verifiedUser.last_name,
        email: verifiedUser.email,
        phone: verifiedUser.phone,
        role: verifiedUser.role,
        isVerified: verifiedUser.is_verified,
      },
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
