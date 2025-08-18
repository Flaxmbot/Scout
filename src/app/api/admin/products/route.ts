import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/firebase';
// Admin products with enhanced functionality

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const lastDocParam = searchParams.get('lastDoc');
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

    let result = await ProductsService.getAll({
      limit: lowStockOnly ? 1000 : limit, // Get more products if filtering by low stock
      // lastDoc should be a DocumentSnapshot, not a string
      // For now, we'll skip pagination in admin routes  
      category,
      search,
      isFeatured: featured
    });

    // Filter low stock products if requested
    if (lowStockOnly && result.products) {
      const lowStockProducts = result.products.filter(product => {
        // Consider low stock if quantity is less than 10 or doesn't exist
        const stock = product.stockQuantity || product.stock || 0;
        return stock < 10;
      });
      
      result = {
        ...result,
        products: lowStockProducts.slice(0, limit), // Apply limit after filtering
        totalCount: lowStockProducts.length
      };
    }

    return NextResponse.json(result.products || [], { status: 200 });

  } catch (error) {
    console.error('GET admin products error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProduct = await ProductsService.create(body);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('POST admin products error:', error);
    return NextResponse.json({
      error: 'Failed to create product: ' + error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'Product ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const updatedProduct = await ProductsService.update(id, body);
    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error: any) {
    console.error('PUT admin products error:', error);
    
    if (error.message === 'Product not found') {
      return NextResponse.json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'Product ID is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    await ProductsService.delete(id);
    return NextResponse.json({
      message: 'Product deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('DELETE admin products error:', error);
    
    if (error.message === 'Product not found') {
      return NextResponse.json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}