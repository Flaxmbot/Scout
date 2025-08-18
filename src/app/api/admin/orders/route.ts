import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase';
// Admin orders with enhanced functionality

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const lastDocParam = searchParams.get('lastDoc');
    const status = searchParams.get('status') || undefined;
    const customerEmail = searchParams.get('customerEmail') || undefined;

    const orders = await OrdersService.getAll({
      limit,
      // lastDoc should be a DocumentSnapshot, not a string
      // For now, we'll skip pagination in admin routes
      status
      // customerEmail parameter not supported by OrdersService.getAll
    });

    return NextResponse.json({
      orders: orders,
      total: orders.length,
      hasMore: orders.length === limit
    }, { status: 200 });

  } catch (error) {
    console.error('GET admin orders error:', error);
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
        error: 'Order ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({
        error: 'Status is required',
        code: 'MISSING_STATUS'
      }, { status: 400 });
    }

    const updatedOrder = await OrdersService.updateStatus(id, status);
    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error('PUT admin orders error:', error);
    
    if (error.message === 'Order not found') {
      return NextResponse.json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}