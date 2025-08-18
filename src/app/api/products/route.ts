import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/firebase/services';
import { Product } from '@/lib/firebase/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      const product = await ProductsService.getById(id);

      if (!product) {
        return NextResponse.json({ 
          error: 'Product not found' 
        }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // List products with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const color = searchParams.get('color');
    const size = searchParams.get('size');
    const isFeatured = searchParams.get('isFeatured');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const result = await ProductsService.getAll({
      limit,
      search: search || undefined,
      category: category || undefined,
      color: color || undefined,
      size: size || undefined,
      isFeatured: isFeatured ? isFeatured === 'true' : undefined,
      sort: sort as any,
      order: order as any
    });

    return NextResponse.json(result.products);
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
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!body.price || typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json({ 
        error: "Price is required and must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!body.category || typeof body.category !== 'string' || body.category.trim() === '') {
      return NextResponse.json({ 
        error: "Category is required and must be a non-empty string",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    if (!body.color || typeof body.color !== 'string' || body.color.trim() === '') {
      return NextResponse.json({ 
        error: "Color is required and must be a non-empty string",
        code: "MISSING_COLOR" 
      }, { status: 400 });
    }

    if (!body.size || typeof body.size !== 'string' || body.size.trim() === '') {
      return NextResponse.json({ 
        error: "Size is required and must be a non-empty string",
        code: "MISSING_SIZE" 
      }, { status: 400 });
    }

    // Sanitize and prepare data
    const productData: Omit<Product, 'id' | 'createdAt'> = {
      name: body.name.trim(),
      description: body.description ? body.description.trim() : null,
      price: body.price,
      salePrice: body.salePrice || null,
      imageUrl: body.imageUrl ? body.imageUrl.trim() : null,
      category: body.category.trim(),
      color: body.color.trim(),
      size: body.size.trim(),
      stockQuantity: body.stockQuantity || 0,
      isFeatured: body.isFeatured || false
    };

    const newProduct = await ProductsService.create(productData);

    return NextResponse.json(newProduct, { status: 201 });
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

    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    // Validate fields if provided
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (body.price !== undefined && (typeof body.price !== 'number' || body.price <= 0)) {
      return NextResponse.json({ 
        error: "Price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (body.category !== undefined && (typeof body.category !== 'string' || body.category.trim() === '')) {
      return NextResponse.json({ 
        error: "Category must be a non-empty string",
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    if (body.color !== undefined && (typeof body.color !== 'string' || body.color.trim() === '')) {
      return NextResponse.json({ 
        error: "Color must be a non-empty string",
        code: "INVALID_COLOR" 
      }, { status: 400 });
    }

    if (body.size !== undefined && (typeof body.size !== 'string' || body.size.trim() === '')) {
      return NextResponse.json({ 
        error: "Size must be a non-empty string",
        code: "INVALID_SIZE" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: Partial<Omit<Product, 'id' | 'createdAt'>> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.color !== undefined) updateData.color = body.color.trim();
    if (body.size !== undefined) updateData.size = body.size.trim();
    if (body.stockQuantity !== undefined) updateData.stockQuantity = body.stockQuantity;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;

    const updatedProduct = await ProductsService.update(id, updateData);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('PUT error:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
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

    const deletedProduct = await ProductsService.delete(id);

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    console.error('DELETE error:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}