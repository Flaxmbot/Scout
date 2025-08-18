import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        error: 'Order ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    const order = await OrdersService.getById(id);
    
    if (!order) {
      return NextResponse.json({
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error: any) {
    console.error('GET admin order by ID error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        error: 'Order ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({
        error: 'Status is required',
        code: 'MISSING_STATUS'
      }, { status: 400 });
    }

    // Update order status
    const updatedOrder = await OrdersService.updateStatus(id, status);
    
    // Add notes if provided
    if (notes) {
      // Note: This would require extending OrdersService to support notes
      console.log('Order notes update requested:', notes);
    }

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error('PUT admin order error:', error);
    
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        error: 'Order ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    await OrdersService.delete(id);
    
    return NextResponse.json({
      message: 'Order deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('DELETE admin order error:', error);
    
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