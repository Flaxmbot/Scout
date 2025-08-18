import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds, status, notes } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({
        error: 'Order IDs array is required',
        code: 'MISSING_ORDER_IDS'
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({
        error: 'Status is required',
        code: 'MISSING_STATUS'
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status provided',
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Update each order individually
    for (const orderId of orderIds) {
      try {
        const updatedOrder = await OrdersService.updateStatus(orderId, status);
        results.push({
          orderId,
          success: true,
          order: updatedOrder
        });
      } catch (error: any) {
        console.error(`Failed to update order ${orderId}:`, error);
        errors.push({
          orderId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    return NextResponse.json({
      message: `Bulk update completed: ${successCount} successful, ${errorCount} failed`,
      successCount,
      errorCount,
      results,
      errors: errorCount > 0 ? errors : undefined
    }, { status: 200 });

  } catch (error: any) {
    console.error('Bulk update orders error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}