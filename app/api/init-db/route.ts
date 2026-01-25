import { NextRequest, NextResponse } from 'next/server';
import { initializeDataIfEmpty, hasData } from '@/lib/init-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dataExists = await hasData()
    
    if (dataExists) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data already exists',
        dataExists: true 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'No data found. Call POST to initialize sample data',
      dataExists: false 
    })
  } catch (error) {
    console.error('Error checking data:', error)
    return NextResponse.json(
      { error: 'Failed to check data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing database data...')
    
    await initializeDataIfEmpty()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully!' 
    })
  } catch (error) {
    console.error('Error initializing data:', error)
    return NextResponse.json(
      { error: 'Failed to initialize data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
