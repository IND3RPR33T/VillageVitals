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

    // Create user and auto-verify (bypass OTP)
    const userData = {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role,
      isVerified: true, // Auto-verify user
      isActive: true,
      verifiedAt: new Date(),
    };

    const newUser = await createUser(userData);
    
    // Skip OTP generation and email sending
    console.log('User registered and auto-verified:', email);

    return NextResponse.json({
      message: 'User registered successfully and is ready to use the app!',
      userId: newUser.id,
      email: newUser.email,
      isVerified: true,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
