import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    return NextResponse.json({
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
