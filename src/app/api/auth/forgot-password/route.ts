import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required field: email
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Send password reset email via Firebase Auth
    await AuthService.sendPasswordReset(email);

    // Always return success message for security (don't reveal if email exists)
    return NextResponse.json({
      message: "If an account with this email exists, a password reset link has been sent to your email address."
    }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Always return success for security reasons, even if there was an error
    return NextResponse.json({
      message: "If an account with this email exists, a password reset link has been sent to your email address."
    }, { status: 200 });
  }
}