import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase/services';
import { OrderItem } from '@/lib/firebase/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    // Order items are stored as subcollections, so orderId is required
    if (!orderId) {
      return NextResponse.json({ 
        error: "Order ID is required",
        code: "MISSING_ORDER_ID" 
      }, { status: 400 });
    }

    const orderItems = await OrdersService.getOrderItems(orderId);
    return NextResponse.json(orderItems);

  } catch (error) {
    console.error('GET error:', error);
    if (error instanceof Error && error.message === 'Order not found') {
      return NextResponse.json({ 
        error: error.message,
        code: "ORDER_NOT_FOUND" 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, quantity, price, size, color } = body;

    // Validate required fields
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ 
        error: "Order ID is required",
        code: "MISSING_ORDER_ID" 
      }, { status: 400 });
    }

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: "Valid quantity is required",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    if (!price || price <= 0) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!size || typeof size !== 'string' || size.trim() === '') {
      return NextResponse.json({ 
        error: "Size is required",
        code: "MISSING_SIZE" 
      }, { status: 400 });
    }

    if (!color || typeof color !== 'string' || color.trim() === '') {
      return NextResponse.json({ 
        error: "Color is required",
        code: "MISSING_COLOR" 
      }, { status: 400 });
    }

    const orderItemData: Omit<OrderItem, 'id' | 'orderId'> = {
      productId,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      size: size.trim(),
      color: color.trim()
    };

    const newOrderItem = await OrdersService.addOrderItem(orderId, orderItemData);

    return NextResponse.json(newOrderItem, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    if (error instanceof Error) {
      if (error.message === 'Order not found') {
        return NextResponse.json({ 
          error: error.message,
          code: "ORDER_NOT_FOUND" 
        }, { status: 400 });
      }
      if (error.message === 'Product not found') {
        return NextResponse.json({ 
          error: error.message,
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 400 });
      }
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// Note: PUT and DELETE are not implemented for order items as subcollections
// Order items should be immutable once created, or managed through the parent order
export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    error: "Order items cannot be updated directly. Please create a new order or contact support.",
    code: "NOT_SUPPORTED" 
  }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: "Order items cannot be deleted directly. Please contact support for order modifications.",
    code: "NOT_SUPPORTED" 
  }, { status: 405 });
}