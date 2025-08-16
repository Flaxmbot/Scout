import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or, desc, asc, count, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const stats = searchParams.get('stats');

    // Get user statistics
    if (stats === 'true') {
      const totalUsers = await db.select({ count: count() }).from(users);
      const roleDistribution = await db.select({
        role: users.role,
        count: count()
      })
      .from(users)
      .groupBy(users.role);

      return NextResponse.json({
        totalUsers: totalUsers[0].count,
        roleDistribution
      });
    }

    // Get single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const user = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

      if (user.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(user[0]);
    }

    // Build query for user list
    let query = db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const validSortFields = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? asc : desc;
    
    query = query.orderBy(sortOrder(users[sortField as keyof typeof users]));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        error: "Password must be at least 6 characters long",
        code: "WEAK_PASSWORD"
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        error: "Email already exists",
        code: "EMAIL_EXISTS"
      }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db.insert(users)
      .values({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        role: role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add email if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({
          error: "Invalid email format",
          code: "INVALID_EMAIL"
        }, { status: 400 });
      }

      // Check if email already exists for another user
      const emailCheck = await db.select()
        .from(users)
        .where(and(
          eq(users.email, email.toLowerCase().trim()),
          sql`${users.id} != ${parseInt(id)}`
        ))
        .limit(1);

      if (emailCheck.length > 0) {
        return NextResponse.json({
          error: "Email already exists",
          code: "EMAIL_EXISTS"
        }, { status: 400 });
      }

      updates.email = email.toLowerCase().trim();
    }

    // Validate and add password if provided
    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json({
          error: "Password must be at least 6 characters long",
          code: "WEAK_PASSWORD"
        }, { status: 400 });
      }

      const saltRounds = 12;
      updates.password = await bcrypt.hash(password, saltRounds);
    }

    // Add name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({
          error: "Name cannot be empty",
          code: "INVALID_NAME"
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    // Add role if provided
    if (role !== undefined) {
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({
          error: "Invalid role. Must be 'user' or 'admin'",
          code: "INVALID_ROLE"
        }, { status: 400 });
      }
      updates.role = role;
    }

    // Update user
    const updatedUser = await db.update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    return NextResponse.json(updatedUser[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    // Safety check: prevent deletion of admin users if they are the last admin
    if (existingUser[0].role === 'admin') {
      const adminCount = await db.select({ count: count() })
        .from(users)
        .where(eq(users.role, 'admin'));

      if (adminCount[0].count <= 1) {
        return NextResponse.json({
          error: "Cannot delete the last admin user",
          code: "LAST_ADMIN_PROTECTION"
        }, { status: 400 });
      }
    }

    // Delete user
    const deletedUser = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: deletedUser[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}