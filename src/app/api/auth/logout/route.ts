import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ 
        error: "Authorization header is required",
        code: "MISSING_AUTH_HEADER" 
      }, { status: 401 });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: "Invalid authorization format. Expected 'Bearer <token>'",
        code: "INVALID_AUTH_FORMAT" 
      }, { status: 401 });
    }

    // Extract token
    const idToken = authHeader.substring(7).trim();
    
    if (!idToken) {
      return NextResponse.json({ 
        error: "Token is required",
        code: "MISSING_TOKEN" 
      }, { status: 401 });
    }

    try {
      // Verify the token is valid before logout
      await AuthService.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid or expired session token",
        code: "INVALID_TOKEN" 
      }, { status: 401 });
    }

    // Note: With Firebase Auth, logout is handled client-side.
    // This endpoint serves as a validation point and for consistency.
    // The actual logout (clearing the auth state) happens on the client.
    
    return NextResponse.json({ 
      message: "Successfully logged out",
      success: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('POST logout error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}