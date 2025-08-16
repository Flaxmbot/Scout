import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, categories, orderItems, analytics } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte, sql, sum, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single product with detailed analytics
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Get sales data for this product
      const salesData = await db.select({
        totalSold: sum(orderItems.quantity),
        totalRevenue: sum(sql`${orderItems.quantity} * ${orderItems.price}`),
        orderCount: count(orderItems.id)
      })
      .from(orderItems)
      .where(eq(orderItems.productId, parseInt(id)));

      // Get recent analytics metrics for this product
      const recentAnalytics = await db.select()
        .from(analytics)
        .where(
          and(
            like(analytics.metricName, `product_${id}_%`),
            gte(analytics.date, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          )
        )
        .orderBy(desc(analytics.date))
        .limit(30);

      return NextResponse.json({
        ...product[0],
        analytics: {
          totalSold: salesData[0]?.totalSold || 0,
          totalRevenue: salesData[0]?.totalRevenue || 0,
          orderCount: salesData[0]?.orderCount || 0,
          stockStatus: product[0].stockQuantity <= 5 ? 'low' : product[0].stockQuantity <= 20 ? 'medium' : 'high',
          recentMetrics: recentAnalytics
        }
      });
    }

    // List products with advanced filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minStock = searchParams.get('minStock');
    const maxStock = searchParams.get('maxStock');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

    let query = db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      salePrice: products.salePrice,
      imageUrl: products.imageUrl,
      category: products.category,
      color: products.color,
      size: products.size,
      stockQuantity: products.stockQuantity,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt
    }).from(products);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`),
          like(products.category, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (status === 'active') {
      conditions.push(gte(products.stockQuantity, 1));
    } else if (status === 'inactive') {
      conditions.push(eq(products.stockQuantity, 0));
    }

    if (minPrice) {
      conditions.push(gte(products.price, parseFloat(minPrice)));
    }

    if (maxPrice) {
      conditions.push(lte(products.price, parseFloat(maxPrice)));
    }

    if (minStock) {
      conditions.push(gte(products.stockQuantity, parseInt(minStock)));
    }

    if (maxStock) {
      conditions.push(lte(products.stockQuantity, parseInt(maxStock)));
    }

    if (lowStockOnly) {
      conditions.push(lte(products.stockQuantity, 5));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'name' ? products.name :
                     sort === 'price' ? products.price :
                     sort === 'stockQuantity' ? products.stockQuantity :
                     sort === 'category' ? products.category :
                     products.createdAt;

    query = query.orderBy(order === 'asc' ? asc(sortField) : desc(sortField));

    const results = await query.limit(limit).offset(offset);

    // Get sales data for all products in results
    const productIds = results.map(p => p.id);
    let salesDataMap = {};

    if (productIds.length > 0) {
      const salesData = await db.select({
        productId: orderItems.productId,
        totalSold: sum(orderItems.quantity),
        totalRevenue: sum(sql`${orderItems.quantity} * ${orderItems.price}`)
      })
      .from(orderItems)
      .where(sql`${orderItems.productId} IN (${productIds.join(',')})`)
      .groupBy(orderItems.productId);

      salesDataMap = salesData.reduce((acc, item) => {
        acc[item.productId] = {
          totalSold: item.totalSold || 0,
          totalRevenue: item.totalRevenue || 0
        };
        return acc;
      }, {});
    }

    const enrichedResults = results.map(product => ({
      ...product,
      stockStatus: product.stockQuantity <= 5 ? 'low' : product.stockQuantity <= 20 ? 'medium' : 'high',
      salesData: salesDataMap[product.id] || { totalSold: 0, totalRevenue: 0 }
    }));

    return NextResponse.json(enrichedResults);

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
    const { searchParams } = new URL(request.url);
    const bulk = searchParams.get('bulk') === 'true';

    if (bulk) {
      // Handle bulk operations
      const { operation, productIds, updates } = body;

      if (!operation || !productIds || !Array.isArray(productIds)) {
        return NextResponse.json({ 
          error: "Bulk operation requires operation type and productIds array",
          code: "MISSING_BULK_PARAMS" 
        }, { status: 400 });
      }

      const updatedProducts = [];

      for (const productId of productIds) {
        if (isNaN(parseInt(productId))) continue;

        const updateData = {
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const updated = await db.update(products)
          .set(updateData)
          .where(eq(products.id, parseInt(productId)))
          .returning();

        if (updated.length > 0) {
          updatedProducts.push(updated[0]);
        }
      }

      return NextResponse.json({
        message: `Bulk ${operation} completed`,
        updatedCount: updatedProducts.length,
        products: updatedProducts
      }, { status: 200 });
    }

    // Regular product creation
    const { name, description, price, salePrice, imageUrl, category, color, size, stockQuantity, isFeatured } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: "Product name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!category || category.trim() === '') {
      return NextResponse.json({ 
        error: "Category is required",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    if (!color || color.trim() === '') {
      return NextResponse.json({ 
        error: "Color is required",
        code: "MISSING_COLOR" 
      }, { status: 400 });
    }

    if (!size || size.trim() === '') {
      return NextResponse.json({ 
        error: "Size is required",
        code: "MISSING_SIZE" 
      }, { status: 400 });
    }

    // Verify category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.name, category.trim()))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ 
        error: "Category does not exist",
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    // Generate SKU (simple implementation based on category and timestamp)
    const timestamp = Date.now().toString().slice(-6);
    const categoryCode = category.trim().toUpperCase().substring(0, 3);
    const sku = `${categoryCode}-${timestamp}`;

    const newProduct = await db.insert(products)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        imageUrl: imageUrl?.trim() || null,
        category: category.trim(),
        color: color.trim(),
        size: size.trim(),
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        isFeatured: Boolean(isFeatured),
        createdAt: new Date().toISOString()
      })
      .returning();

    // Log product creation analytics
    await db.insert(analytics)
      .values({
        metricName: 'product_created',
        value: 1,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });

    return NextResponse.json({
      ...newProduct[0],
      sku,
      stockStatus: newProduct[0].stockQuantity <= 5 ? 'low' : newProduct[0].stockQuantity <= 20 ? 'medium' : 'high'
    }, { status: 201 });

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
    const bulk = searchParams.get('bulk') === 'true';
    const body = await request.json();

    if (bulk) {
      // Handle bulk stock adjustments
      const { adjustments } = body;

      if (!adjustments || !Array.isArray(adjustments)) {
        return NextResponse.json({ 
          error: "Bulk adjustments require adjustments array",
          code: "MISSING_ADJUSTMENTS" 
        }, { status: 400 });
      }

      const results = [];

      for (const adjustment of adjustments) {
        const { productId, stockChange, reason } = adjustment;

        if (!productId || isNaN(parseInt(productId))) continue;

        // Get current product
        const currentProduct = await db.select()
          .from(products)
          .where(eq(products.id, parseInt(productId)))
          .limit(1);

        if (currentProduct.length === 0) continue;

        const newStock = Math.max(0, currentProduct[0].stockQuantity + parseInt(stockChange));

        const updated = await db.update(products)
          .set({
            stockQuantity: newStock,
            updatedAt: new Date().toISOString()
          })
          .where(eq(products.id, parseInt(productId)))
          .returning();

        if (updated.length > 0) {
          results.push({
            ...updated[0],
            adjustment: {
              previousStock: currentProduct[0].stockQuantity,
              change: parseInt(stockChange),
              reason: reason || 'bulk adjustment'
            }
          });

          // Log inventory adjustment
          await db.insert(analytics)
            .values({
              metricName: `product_${productId}_stock_adjustment`,
              value: parseInt(stockChange),
              date: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString()
            });
        }
      }

      return NextResponse.json({
        message: 'Bulk stock adjustments completed',
        adjustedCount: results.length,
        products: results
      });
    }

    // Regular single product update
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { name, description, price, salePrice, imageUrl, category, color, size, stockQuantity, isFeatured, stockAdjustment } = body;

    // Validate fields if provided
    if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (category && category.trim() !== '') {
      const existingCategory = await db.select()
        .from(categories)
        .where(eq(categories.name, category.trim()))
        .limit(1);

      if (existingCategory.length === 0) {
        return NextResponse.json({ 
          error: "Category does not exist",
          code: "INVALID_CATEGORY" 
        }, { status: 400 });
      }
    }

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (price !== undefined) updates.price = parseFloat(price);
    if (salePrice !== undefined) updates.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl?.trim() || null;
    if (category !== undefined) updates.category = category.trim();
    if (color !== undefined) updates.color = color.trim();
    if (size !== undefined) updates.size = size.trim();
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);

    // Handle stock adjustments
    if (stockAdjustment !== undefined) {
      const newStock = Math.max(0, existingProduct[0].stockQuantity + parseInt(stockAdjustment));
      updates.stockQuantity = newStock;

      // Log stock adjustment
      await db.insert(analytics)
        .values({
          metricName: `product_${id}_stock_adjustment`,
          value: parseInt(stockAdjustment),
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
    } else if (stockQuantity !== undefined) {
      updates.stockQuantity = Math.max(0, parseInt(stockQuantity));
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    // Check for low stock alert
    const lowStockThreshold = 5;
    if (updated[0].stockQuantity <= lowStockThreshold && updated[0].stockQuantity > 0) {
      await db.insert(analytics)
        .values({
          metricName: `product_${id}_low_stock_alert`,
          value: updated[0].stockQuantity,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
    }

    return NextResponse.json({
      ...updated[0],
      stockStatus: updated[0].stockQuantity <= 5 ? 'low' : updated[0].stockQuantity <= 20 ? 'medium' : 'high',
      stockAdjustment: stockAdjustment ? {
        previousStock: existingProduct[0].stockQuantity,
        adjustment: parseInt(stockAdjustment),
        newStock: updated[0].stockQuantity
      } : undefined
    });

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

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product has associated orders
    const associatedOrders = await db.select()
      .from(orderItems)
      .where(eq(orderItems.productId, parseInt(id)))
      .limit(1);

    if (associatedOrders.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete product with existing orders. Consider marking as inactive instead.",
        code: "PRODUCT_HAS_ORDERS" 
      }, { status: 400 });
    }

    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    // Log product deletion
    await db.insert(analytics)
      .values({
        metricName: 'product_deleted',
        value: 1,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}