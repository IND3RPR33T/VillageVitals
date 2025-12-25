import { NextRequest, NextResponse } from 'next/server';
import { createOTP, getUserByEmailOrPhone } from '@/lib/db';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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

    // Check if user exists
    const user = await getUserByEmailOrPhone(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.is_verified) {
      return NextResponse.json(
        { error: 'Account is already verified' },
        { status: 400 }
      );
    }

    // Generate and send new OTP
    const otpCode = generateOTP();
    await createOTP(email, otpCode);

    const emailResult = await sendOTPEmail(email, otpCode, user.first_name);
    
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
