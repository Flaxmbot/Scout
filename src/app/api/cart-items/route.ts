import { NextRequest, NextResponse } from 'next/server';
import { CartItemsService } from '@/lib/firebase/services';
import { CartItem } from '@/lib/firebase/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sessionId = searchParams.get('sessionId');
    const productId = searchParams.get('productId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    // Single record fetch by ID
    if (id) {
      const cartItem = await CartItemsService.getById(id);

      if (!cartItem) {
        return NextResponse.json({ 
          error: 'Cart item not found' 
        }, { status: 404 });
      }

      return NextResponse.json(cartItem);
    }

    // List with filtering
    const result = await CartItemsService.getAll({
      limit,
      sessionId: sessionId || undefined,
      productId: productId || undefined
    });

    return NextResponse.json(result.cartItems);

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
    if (!body.productId || typeof body.productId !== 'string') {
      return NextResponse.json({ 
        error: "Valid product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!body.quantity || isNaN(parseInt(body.quantity)) || parseInt(body.quantity) < 1) {
      return NextResponse.json({ 
        error: "Valid quantity (minimum 1) is required",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    if (!body.size || typeof body.size !== 'string' || body.size.trim() === '') {
      return NextResponse.json({ 
        error: "Size is required",
        code: "MISSING_SIZE" 
      }, { status: 400 });
    }

    if (!body.color || typeof body.color !== 'string' || body.color.trim() === '') {
      return NextResponse.json({ 
        error: "Color is required",
        code: "MISSING_COLOR" 
      }, { status: 400 });
    }

    if (!body.sessionId || typeof body.sessionId !== 'string' || body.sessionId.trim() === '') {
      return NextResponse.json({ 
        error: "Session ID is required",
        code: "MISSING_SESSION_ID" 
      }, { status: 400 });
    }

    // Create cart item data
    const cartItemData: Omit<CartItem, 'id' | 'createdAt'> = {
      productId: body.productId,
      quantity: parseInt(body.quantity),
      size: body.size.trim(),
      color: body.color.trim(),
      sessionId: body.sessionId.trim()
    };

    const newCartItem = await CartItemsService.create(cartItemData);

    return NextResponse.json(newCartItem, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json({ 
        error: error.message,
        code: "PRODUCT_NOT_FOUND" 
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
    const body = await request.json();

    // Validate ID
    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Prepare update object
    const updates: Partial<Omit<CartItem, 'id' | 'createdAt'>> = {};

    // Validate and set fields if provided
    if (body.productId !== undefined) {
      if (typeof body.productId !== 'string') {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }
      updates.productId = body.productId;
    }

    if (body.quantity !== undefined) {
      if (isNaN(parseInt(body.quantity)) || parseInt(body.quantity) < 1) {
        return NextResponse.json({ 
          error: "Valid quantity (minimum 1) is required",
          code: "INVALID_QUANTITY" 
        }, { status: 400 });
      }
      updates.quantity = parseInt(body.quantity);
    }

    if (body.size !== undefined) {
      if (typeof body.size !== 'string' || body.size.trim() === '') {
        return NextResponse.json({ 
          error: "Size must be a non-empty string",
          code: "INVALID_SIZE" 
        }, { status: 400 });
      }
      updates.size = body.size.trim();
    }

    if (body.color !== undefined) {
      if (typeof body.color !== 'string' || body.color.trim() === '') {
        return NextResponse.json({ 
          error: "Color must be a non-empty string",
          code: "INVALID_COLOR" 
        }, { status: 400 });
      }
      updates.color = body.color.trim();
    }

    if (body.sessionId !== undefined) {
      if (typeof body.sessionId !== 'string' || body.sessionId.trim() === '') {
        return NextResponse.json({ 
          error: "Session ID must be a non-empty string",
          code: "INVALID_SESSION_ID" 
        }, { status: 400 });
      }
      updates.sessionId = body.sessionId.trim();
    }

    // Update the record
    const updated = await CartItemsService.update(id, updates);

    return NextResponse.json(updated);

  } catch (error) {
    console.error('PUT error:', error);
    if (error instanceof Error) {
      if (error.message === 'Cart item not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Delete the record
    const deleted = await CartItemsService.delete(id);

    return NextResponse.json({
      message: 'Cart item deleted successfully',
      deletedItem: deleted
    });

  } catch (error) {
    console.error('DELETE error:', error);
    if (error instanceof Error && error.message === 'Cart item not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}