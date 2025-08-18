import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';
// Admin users with Firebase Auth integration

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const stats = searchParams.get('stats');

    // Get user statistics
    if (stats === 'true') {
      return NextResponse.json({
        totalUsers: 0,
        roleDistribution: [
          { role: 'user', count: 0 },
          { role: 'admin', count: 0 },
          { role: 'manager', count: 0 }
        ]
      });
    }

    // Get single user by ID
    if (id) {
      const user = await AuthService.getUserById(id);
      
      if (!user) {
        return NextResponse.json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(user, { status: 200 });
    }

    // Get user list - placeholder for now
    return NextResponse.json({
      users: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET admin users error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Create user with Firebase Auth
    const { user } = await AuthService.register(email, password, name, role);
    
    return NextResponse.json(user, { status: 201 });

  } catch (error: any) {
    console.error('POST admin users error:', error);
    return NextResponse.json({
      error: 'Failed to create user: ' + error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'User ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const updatedUser = await AuthService.updateUserProfile(id, body);
    
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) {
    console.error('PUT admin users error:', error);
    
    if (error.message === 'User not found') {
      return NextResponse.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'User ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    // TODO: Implement user deletion with Firebase Auth Admin
    return NextResponse.json({
      error: 'User deletion not yet implemented',
      code: 'NOT_IMPLEMENTED'
    }, { status: 501 });

  } catch (error: any) {
    console.error('DELETE admin users error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}