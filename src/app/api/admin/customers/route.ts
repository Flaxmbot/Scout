import { NextRequest, NextResponse } from 'next/server';
import { CustomersService } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get single customer
      const customer = await CustomersService.getById(id);
      
      if (!customer) {
        return NextResponse.json({
          error: 'Customer not found',
          code: 'CUSTOMER_NOT_FOUND'
        }, { status: 404 });
      }
      
      // Also get customer's orders
      const orders = await CustomersService.getCustomerOrders(id, 20);
      
      return NextResponse.json({
        ...customer,
        orders
      }, { status: 200 });
    }
    
    // Get all customers with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const segment = searchParams.get('segment') || undefined;
    const searchQuery = searchParams.get('search') || undefined;
    
    const customers = await CustomersService.getAll({
      limit,
      offset,
      segment,
      searchQuery
    });
    
    // Get segment statistics
    const segmentStats = await CustomersService.getSegmentStats();
    
    return NextResponse.json({
      customers,
      total: customers.length,
      segmentStats,
      pagination: {
        limit,
        offset,
        hasMore: customers.length === limit
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('GET customers error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'Customer ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { phone, address, tags, notes } = body;
    
    const updatedCustomer = await CustomersService.updateCustomer(id, {
      phone,
      address,
      tags,
      notes
    });
    
    if (!updatedCustomer) {
      return NextResponse.json({
        error: 'Customer not found',
        code: 'CUSTOMER_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json(updatedCustomer, { status: 200 });
    
  } catch (error: any) {
    console.error('PUT customers error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}