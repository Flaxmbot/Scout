import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oobCode, newPassword } = body;

    // Validate required fields
    if (!oobCode) {
      return NextResponse.json({ 
        error: "Reset token is required",
        code: "MISSING_TOKEN" 
      }, { status: 400 });
    }

    if (!newPassword) {
      return NextResponse.json({ 
        error: "New password is required",
        code: "MISSING_PASSWORD" 
      }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD" 
      }, { status: 400 });
    }

    // Reset password using Firebase Auth
    await AuthService.resetPassword(oobCode, newPassword);

    return NextResponse.json({
      message: "Password reset successfully",
      success: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('Password reset error:', error);
    
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return NextResponse.json({ 
        error: "Reset token has expired or is invalid",
        code: "INVALID_TOKEN" 
      }, { status: 401 });
    }
    
    if (error.message.includes('Password')) {
      return NextResponse.json({ 
        error: error.message,
        code: "WEAK_PASSWORD" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Password reset failed: ' + error.message 
    }, { status: 500 });
  }
}