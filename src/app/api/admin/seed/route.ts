import { NextRequest, NextResponse } from 'next/server';
import { seedAll } from '@/lib/firebase/seeds';

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding via API...');
    
    // Run the seeding process
    await seedAll();
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      success: true 
    }, { status: 200 });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      error: 'Failed to seed database: ' + (error instanceof Error ? error.message : 'Unknown error'),
      success: false
    }, { status: 500 });
  }
}