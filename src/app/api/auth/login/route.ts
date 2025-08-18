import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({
        error: "Email is required",
        code: "MISSING_EMAIL"
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({
        error: "Password is required",
        code: "MISSING_PASSWORD"
      }, { status: 400 });
    }

    // Login user with Firebase Auth
    const { user, firebaseUser } = await AuthService.login(email, password);
    
    // Get Firebase ID token for the client
    const idToken = await firebaseUser.getIdToken();
    
    return NextResponse.json({
      user: user,
      sessionToken: idToken, // Using Firebase ID token as session token
      expiresIn: '3600' // Firebase tokens expire in 1 hour by default
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle Firebase Auth errors
    if (error.message === 'Invalid credentials') {
      return NextResponse.json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      }, { status: 401 });
    }
    
    if (error.message === 'User profile not found') {
      return NextResponse.json({
        error: "User profile not found",
        code: "PROFILE_NOT_FOUND"
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Login failed: ' + error.message
    }, { status: 500 });
  }
}