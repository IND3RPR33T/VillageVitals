import { NextRequest, NextResponse } from 'next/server';
import { getUserById, sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['community', 'health-worker', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    // Check if phone number is already used by another user
    const existingPhone = await sql`
      SELECT id FROM users 
      WHERE phone = ${phone} AND id != ${payload.userId}
      LIMIT 1
    `;

    if (existingPhone.length > 0) {
      return NextResponse.json(
        { error: 'Phone number is already in use by another account' },
        { status: 409 }
      );
    }

    // Update user profile
    const result = await sql`
      UPDATE users 
      SET 
        first_name = ${firstName},
        last_name = ${lastName},
        phone = ${phone},
        role = ${role},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${payload.userId}
      RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = result[0];

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.is_verified,
        createdAt: updatedUser.created_at,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
