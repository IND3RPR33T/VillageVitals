import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailOrPhone } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

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

    // Find user by email or phone
    const user = await getUserByEmailOrPhone(contact);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json(
        { error: 'Please verify your account first. Check your email for the OTP code.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if role matches
    if (user.role !== role) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.is_verified,
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
