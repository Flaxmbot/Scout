import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase/services';
import { Order } from '@/lib/firebase/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single order fetch by ID
    if (id) {
      const order = await OrdersService.getById(id);

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json(order);
    }

    // List orders with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const result = await OrdersService.getAll({
      limit,
      search: search || undefined,
      status: status || undefined,
      sort: sort as any,
      order: order as any
    });

    return NextResponse.json(result.orders);
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

    // Validate required fields
    if (!body.customerName || typeof body.customerName !== 'string' || !body.customerName.trim()) {
      return NextResponse.json({ 
        error: "Customer name is required",
        code: "MISSING_CUSTOMER_NAME" 
      }, { status: 400 });
    }

    if (!body.customerEmail || typeof body.customerEmail !== 'string' || !body.customerEmail.trim()) {
      return NextResponse.json({ 
        error: "Customer email is required",
        code: "MISSING_CUSTOMER_EMAIL" 
      }, { status: 400 });
    }

    if (!body.customerPhone || typeof body.customerPhone !== 'string' || !body.customerPhone.trim()) {
      return NextResponse.json({ 
        error: "Customer phone is required",
        code: "MISSING_CUSTOMER_PHONE" 
      }, { status: 400 });
    }

    if (!body.shippingAddress || typeof body.shippingAddress !== 'string' || !body.shippingAddress.trim()) {
      return NextResponse.json({ 
        error: "Shipping address is required",
        code: "MISSING_SHIPPING_ADDRESS" 
      }, { status: 400 });
    }

    if (!body.totalAmount || typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
      return NextResponse.json({ 
        error: "Valid total amount is required",
        code: "INVALID_TOTAL_AMOUNT" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const orderData: Omit<Order, 'id' | 'createdAt'> = {
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim(),
      customerPhone: body.customerPhone.trim(),
      shippingAddress: body.shippingAddress.trim(),
      totalAmount: body.totalAmount,
      status: body.status?.trim() || 'pending'
    };

    const newOrder = await OrdersService.create(orderData);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    if (error instanceof Error && error.message === 'Invalid email format') {
      return NextResponse.json({ 
        error: "Valid email address is required",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const updates: Partial<Omit<Order, 'id' | 'createdAt'>> = {};

    // Validate and sanitize fields if provided
    if (body.customerName !== undefined) {
      if (typeof body.customerName !== 'string' || !body.customerName.trim()) {
        return NextResponse.json({ 
          error: "Customer name must be a non-empty string",
          code: "INVALID_CUSTOMER_NAME" 
        }, { status: 400 });
      }
      updates.customerName = body.customerName.trim();
    }

    if (body.customerEmail !== undefined) {
      if (typeof body.customerEmail !== 'string' || !body.customerEmail.trim()) {
        return NextResponse.json({ 
          error: "Customer email must be a non-empty string",
          code: "INVALID_CUSTOMER_EMAIL" 
        }, { status: 400 });
      }
      updates.customerEmail = body.customerEmail.trim();
    }

    if (body.customerPhone !== undefined) {
      if (typeof body.customerPhone !== 'string' || !body.customerPhone.trim()) {
        return NextResponse.json({ 
          error: "Customer phone must be a non-empty string",
          code: "INVALID_CUSTOMER_PHONE" 
        }, { status: 400 });
      }
      updates.customerPhone = body.customerPhone.trim();
    }

    if (body.shippingAddress !== undefined) {
      if (typeof body.shippingAddress !== 'string' || !body.shippingAddress.trim()) {
        return NextResponse.json({ 
          error: "Shipping address must be a non-empty string",
          code: "INVALID_SHIPPING_ADDRESS" 
        }, { status: 400 });
      }
      updates.shippingAddress = body.shippingAddress.trim();
    }

    if (body.totalAmount !== undefined) {
      if (typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
        return NextResponse.json({ 
          error: "Total amount must be a positive number",
          code: "INVALID_TOTAL_AMOUNT" 
        }, { status: 400 });
      }
      updates.totalAmount = body.totalAmount;
    }

    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || !body.status.trim()) {
        return NextResponse.json({ 
          error: "Status must be a non-empty string",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = body.status.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await OrdersService.update(id, updates);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === 'Invalid email format') {
        return NextResponse.json({ 
          error: "Valid email address is required",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const deleted = await OrdersService.delete(id);

    return NextResponse.json({
      message: 'Order deleted successfully',
      deletedOrder: deleted
    });
  } catch (error) {
    console.error('DELETE error:', error);
    if (error instanceof Error && error.message === 'Order not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}