import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, orders, orderItems, products } from '@/db/schema';
import { eq, like, and, or, desc, asc, sql, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single customer with detailed profile
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const customer = await db.select()
        .from(customers)
        .where(eq(customers.id, parseInt(id)))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json({ 
          error: 'Customer not found' 
        }, { status: 404 });
      }

      // Get customer orders with analytics
      const customerOrders = await db.select({
        orderId: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        itemCount: sql<number>`count(${orderItems.id})`.as('itemCount')
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.customerEmail, customer[0].email))
      .groupBy(orders.id)
      .orderBy(desc(orders.createdAt));

      // Calculate analytics
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const orderCount = customerOrders.length;
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
      const lastOrderDate = customerOrders.length > 0 ? customerOrders[0].createdAt : null;

      // Customer segmentation
      let segment = 'new';
      if (orderCount >= 5 && totalSpent >= 500) {
        segment = 'vip';
      } else if (orderCount >= 3 || totalSpent >= 200) {
        segment = 'loyal';
      } else if (orderCount >= 1) {
        segment = 'active';
      }

      return NextResponse.json({
        ...customer[0],
        analytics: {
          totalSpent,
          orderCount,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          lastOrderDate,
          segment
        },
        orders: customerOrders
      });
    }

    // List customers with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const segment = searchParams.get('segment');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select({
      id: customers.id,
      email: customers.email,
      name: customers.name,
      phone: customers.phone,
      address: customers.address,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`.as('totalSpent'),
      orderCount: sql<number>`COUNT(${orders.id})`.as('orderCount'),
      lastOrderDate: sql<string>`MAX(${orders.createdAt})`.as('lastOrderDate')
    })
    .from(customers)
    .leftJoin(orders, eq(customers.email, orders.customerEmail))
    .groupBy(customers.id);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(customers.name, `%${search}%`),
          like(customers.email, `%${search}%`),
          like(customers.phone, `%${search}%`)
        )
      );
    }

    if (location) {
      conditions.push(like(customers.address, `%${location}%`));
    }

    if (dateFrom) {
      conditions.push(gte(customers.createdAt, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(customers.createdAt, dateTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'name' ? customers.name :
                     sort === 'email' ? customers.email :
                     sort === 'totalSpent' ? sql`totalSpent` :
                     sort === 'orderCount' ? sql`orderCount` :
                     customers.createdAt;

    query = order === 'asc' ? query.orderBy(asc(sortField)) : query.orderBy(desc(sortField));

    let results = await query.limit(limit).offset(offset);

    // Apply segment filtering after query (since it's calculated)
    if (segment) {
      results = results.filter(customer => {
        const { totalSpent, orderCount } = customer;
        let customerSegment = 'new';
        if (orderCount >= 5 && totalSpent >= 500) {
          customerSegment = 'vip';
        } else if (orderCount >= 3 || totalSpent >= 200) {
          customerSegment = 'loyal';
        } else if (orderCount >= 1) {
          customerSegment = 'active';
        }
        return customerSegment === segment;
      });
    }

    // Add segment to each customer
    const customersWithSegment = results.map(customer => {
      const { totalSpent, orderCount } = customer;
      let customerSegment = 'new';
      if (orderCount >= 5 && totalSpent >= 500) {
        customerSegment = 'vip';
      } else if (orderCount >= 3 || totalSpent >= 200) {
        customerSegment = 'loyal';
      } else if (orderCount >= 1) {
        customerSegment = 'active';
      }

      return {
        ...customer,
        averageOrderValue: orderCount > 0 ? Math.round((totalSpent / orderCount) * 100) / 100 : 0,
        segment: customerSegment
      };
    });

    return NextResponse.json(customersWithSegment);

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
    const { email, name, phone, address } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedPhone = phone ? phone.trim() : null;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Check if customer already exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.email, sanitizedEmail))
      .limit(1);

    if (existingCustomer.length > 0) {
      return NextResponse.json({ 
        error: "Customer with this email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    // Validate and parse address if provided
    let parsedAddress = null;
    if (address) {
      if (typeof address === 'string') {
        try {
          parsedAddress = JSON.parse(address);
        } catch (e) {
          parsedAddress = { full: address };
        }
      } else if (typeof address === 'object') {
        parsedAddress = address;
      }
    }

    const newCustomer = await db.insert(customers)
      .values({
        email: sanitizedEmail,
        name: sanitizedName,
        phone: sanitizedPhone,
        address: parsedAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newCustomer[0], { status: 201 });

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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, phone, address, email } = body;

    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, parseInt(id)))
      .limit(1);

    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        error: 'Customer not found' 
      }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and update fields
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      const sanitizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }

      // Check if email is already taken by another customer
      const emailExists = await db.select()
        .from(customers)
        .where(and(
          eq(customers.email, sanitizedEmail),
          sql`${customers.id} != ${parseInt(id)}`
        ))
        .limit(1);

      if (emailExists.length > 0) {
        return NextResponse.json({ 
          error: "Email is already taken by another customer",
          code: "EMAIL_EXISTS" 
        }, { status: 400 });
      }

      updates.email = sanitizedEmail;
    }

    if (phone !== undefined) {
      updates.phone = phone ? phone.trim() : null;
    }

    if (address !== undefined) {
      let parsedAddress = null;
      if (address) {
        if (typeof address === 'string') {
          try {
            parsedAddress = JSON.parse(address);
          } catch (e) {
            parsedAddress = { full: address };
          }
        } else if (typeof address === 'object') {
          parsedAddress = address;
        }
      }
      updates.address = parsedAddress;
    }

    const updatedCustomer = await db.update(customers)
      .set(updates)
      .where(eq(customers.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedCustomer[0]);

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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, parseInt(id)))
      .limit(1);

    if (existingCustomer.length === 0) {
      return NextResponse.json({ 
        error: 'Customer not found' 
      }, { status: 404 });
    }

    // Check if customer has orders
    const customerOrders = await db.select()
      .from(orders)
      .where(eq(orders.customerEmail, existingCustomer[0].email))
      .limit(1);

    if (customerOrders.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete customer with existing orders",
        code: "HAS_ORDERS" 
      }, { status: 400 });
    }

    const deletedCustomer = await db.delete(customers)
      .where(eq(customers.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Customer deleted successfully',
      customer: deletedCustomer[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}