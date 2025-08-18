import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract and sanitize inputs
    const email = body.email?.toString().trim().toLowerCase();
    const password = body.password?.toString();
    const name = body.name?.toString().trim();
    const role = body.role?.toString().trim() || 'user';

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

    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        code: "INVALID_PASSWORD" 
      }, { status: 400 });
    }

    // Register user with Firebase Auth
    const { user } = await AuthService.register(email, password, name, role);

    return NextResponse.json(user, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle Firebase Auth errors with proper status codes
    if (error.message === 'Email already exists') {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 409 });
    }
    
    if (error.message === 'Invalid email format') {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }
    
    if (error.message.includes('Password')) {
      return NextResponse.json({ 
        error: error.message,
        code: "INVALID_PASSWORD" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Registration failed: ' + error.message 
    }, { status: 500 });
  }
}