import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmailOrPhone, createOTP } from '@/lib/db';
import { hashPassword, generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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

    // Check if user already exists
    const existingUser = await getUserByEmailOrPhone(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const existingPhone = await getUserByEmailOrPhone(phone);
    if (existingPhone) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user with unverified status
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role,
      isVerified: false, // User needs to verify OTP
      isActive: false,
      verifiedAt: null,
    };

    const newUser = await createUser(userData);
    
    // Generate and send OTP
    const otp = generateOTP();
    await createOTP({
      userId: newUser.id,
      otp,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendOTPEmail(email, otp, firstName);
    console.log('User registered, OTP sent:', email);

    return NextResponse.json({
      message: 'Registration successful! Please check your email for OTP verification.',
      userId: newUser.id,
      email: newUser.email,
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
