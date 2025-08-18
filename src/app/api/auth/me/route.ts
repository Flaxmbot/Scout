import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({
        error: "Authorization token is required",
        code: "MISSING_TOKEN"
      }, { status: 401 });
    }

    // Verify the Firebase ID token and get user data
    const { user, decodedToken } = await AuthService.verifyIdToken(token);
    
    return NextResponse.json({
      user: user,
      tokenInfo: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        exp: decodedToken.exp,
        iat: decodedToken.iat
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Token verification error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return NextResponse.json({
        error: "Invalid or expired token",
        code: "INVALID_TOKEN"
      }, { status: 401 });
    }
    
    if (error.message === 'User profile not found') {
      return NextResponse.json({
        error: "User profile not found",
        code: "PROFILE_NOT_FOUND"
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Authentication verification failed: ' + error.message
    }, { status: 500 });
  }
}