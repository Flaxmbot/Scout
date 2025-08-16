import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, customers } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte, sql, inArray } from 'drizzle-orm';

const VALID_STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single order with detailed information
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const orderResult = await db.select({
        id: orders.id,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
        shippingAddress: orders.shippingAddress,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

      if (orderResult.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const order = orderResult[0];

      // Get order items with product details
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: orderItems.size,
        color: orderItems.color,
        productId: orderItems.productId,
        productName: products.name,
        productImage: products.imageUrl,
        productCategory: products.category
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, parseInt(id)));

      // Get customer information if exists
      const customerResult = await db.select()
        .from(customers)
        .where(eq(customers.email, order.customerEmail))
        .limit(1);

      const customer = customerResult.length > 0 ? customerResult[0] : null;

      return NextResponse.json({
        ...order,
        items,
        customer
      });
    }

    // List orders with advanced filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const includeStats = searchParams.get('includeStats') === 'true';

    let query = db.select({
      id: orders.id,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      shippingAddress: orders.shippingAddress,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt
    }).from(orders);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(orders.customerName, `%${search}%`),
          like(orders.customerEmail, `%${search}%`),
          like(orders.customerPhone, `%${search}%`)
        )
      );
    }

    if (status && VALID_STATUSES.includes(status)) {
      conditions.push(eq(orders.status, status));
    }

    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(orders.createdAt, endDate));
    }

    if (minAmount) {
      const amount = parseFloat(minAmount);
      if (!isNaN(amount)) {
        conditions.push(gte(orders.totalAmount, amount));
      }
    }

    if (maxAmount) {
      const amount = parseFloat(maxAmount);
      if (!isNaN(amount)) {
        conditions.push(lte(orders.totalAmount, amount));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sort === 'totalAmount') {
      query = order === 'asc' ? query.orderBy(asc(orders.totalAmount)) : query.orderBy(desc(orders.totalAmount));
    } else if (sort === 'customerName') {
      query = order === 'asc' ? query.orderBy(asc(orders.customerName)) : query.orderBy(desc(orders.customerName));
    } else if (sort === 'status') {
      query = order === 'asc' ? query.orderBy(asc(orders.status)) : query.orderBy(desc(orders.status));
    } else {
      query = order === 'asc' ? query.orderBy(asc(orders.createdAt)) : query.orderBy(desc(orders.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

    // Get order statistics if requested
    let statistics = null;
    if (includeStats) {
      const statsQuery = db.select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`SUM(${orders.totalAmount})`,
        averageOrderValue: sql<number>`AVG(${orders.totalAmount})`,
        pendingCount: sql<number>`SUM(CASE WHEN ${orders.status} = 'pending' THEN 1 ELSE 0 END)`,
        processingCount: sql<number>`SUM(CASE WHEN ${orders.status} = 'processing' THEN 1 ELSE 0 END)`,
        shippedCount: sql<number>`SUM(CASE WHEN ${orders.status} = 'shipped' THEN 1 ELSE 0 END)`,
        deliveredCount: sql<number>`SUM(CASE WHEN ${orders.status} = 'delivered' THEN 1 ELSE 0 END)`,
        cancelledCount: sql<number>`SUM(CASE WHEN ${orders.status} = 'cancelled' THEN 1 ELSE 0 END)`
      }).from(orders);

      // Apply same filters for statistics
      if (conditions.length > 0) {
        statsQuery.where(and(...conditions));
      }

      const statsResult = await statsQuery;
      statistics = statsResult[0];
    }

    const response = { orders: results };
    if (statistics) {
      response.statistics = statistics;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bulk = searchParams.get('bulk') === 'true';

    if (bulk) {
      // Handle bulk status updates
      const body = await request.json();
      const { orderIds, status: newStatus } = body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ 
          error: "Order IDs array is required for bulk operations",
          code: "MISSING_ORDER_IDS" 
        }, { status: 400 });
      }

      if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
        return NextResponse.json({ 
          error: "Valid status is required",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }

      // Validate all order IDs exist and status transitions are valid
      const existingOrders = await db.select({ id: orders.id, status: orders.status })
        .from(orders)
        .where(inArray(orders.id, orderIds));

      if (existingOrders.length !== orderIds.length) {
        return NextResponse.json({ 
          error: "Some order IDs not found",
          code: "ORDERS_NOT_FOUND" 
        }, { status: 404 });
      }

      // Validate status transitions for all orders
      for (const order of existingOrders) {
        const currentStatus = order.status || 'pending';
        if (!VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus)) {
          return NextResponse.json({ 
            error: `Invalid status transition from ${currentStatus} to ${newStatus} for order ${order.id}`,
            code: "INVALID_STATUS_TRANSITION" 
          }, { status: 400 });
        }
      }

      const updatedOrders = await db.update(orders)
        .set({
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
        .where(inArray(orders.id, orderIds))
        .returning();

      return NextResponse.json({
        message: `Successfully updated ${updatedOrders.length} orders`,
        updatedOrders
      });
    }

    // Single order update
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { status: newStatus, shippingAddress, customerPhone } = body;

    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentOrder = existingOrder[0];
    const updates = {};

    // Validate status transition if status is being updated
    if (newStatus) {
      if (!VALID_STATUSES.includes(newStatus)) {
        return NextResponse.json({ 
          error: "Invalid status value",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }

      const currentStatus = currentOrder.status || 'pending';
      if (!VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus)) {
        return NextResponse.json({ 
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          code: "INVALID_STATUS_TRANSITION" 
        }, { status: 400 });
      }

      updates.status = newStatus;
    }

    if (shippingAddress) {
      updates.shippingAddress = shippingAddress.trim();
    }

    if (customerPhone) {
      updates.customerPhone = customerPhone.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

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

    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete order items first (foreign key constraint)
    await db.delete(orderItems)
      .where(eq(orderItems.orderId, parseInt(id)));

    // Delete the order
    const deleted = await db.delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Order deleted successfully',
      deletedOrder: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}