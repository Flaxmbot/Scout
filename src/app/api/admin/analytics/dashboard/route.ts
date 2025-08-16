import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, customers, products, analytics, orderItems } from '@/db/schema';
import { count, sum, avg, sql, eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Execute all queries in parallel for better performance
    const [
      totalRevenueResult,
      totalOrdersResult,
      totalCustomersResult,
      totalProductsResult,
      ordersByStatusResult,
      recentAnalyticsResult,
      monthlyRevenueResult,
      topSellingProductsResult
    ] = await Promise.all([
      // Total revenue
      db.select({ 
        totalRevenue: sum(orders.totalAmount) 
      }).from(orders),

      // Total orders count
      db.select({ 
        totalOrders: count(orders.id) 
      }).from(orders),

      // Total customers count
      db.select({ 
        totalCustomers: count(customers.id) 
      }).from(customers),

      // Total products count
      db.select({ 
        totalProducts: count(products.id) 
      }).from(products),

      // Orders by status breakdown
      db.select({
        status: orders.status,
        count: count(orders.id)
      }).from(orders).groupBy(orders.status),

      // Recent analytics data (last 30 entries)
      db.select().from(analytics)
        .orderBy(desc(analytics.createdAt))
        .limit(30),

      // Monthly revenue trends
      db.select({
        month: sql<string>`strftime('%Y-%m', ${orders.createdAt})`.as('month'),
        revenue: sum(orders.totalAmount)
      }).from(orders)
        .groupBy(sql`strftime('%Y-%m', ${orders.createdAt})`)
        .orderBy(sql`strftime('%Y-%m', ${orders.createdAt})`),

      // Top selling products
      db.select({
        productId: orderItems.productId,
        productName: products.name,
        totalQuantity: sum(orderItems.quantity),
        totalRevenue: sum(sql<number>`${orderItems.quantity} * ${orderItems.price}`)
      }).from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .groupBy(orderItems.productId, products.name)
        .orderBy(desc(sum(orderItems.quantity)))
        .limit(10)
    ]);

    // Extract values with null safety
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const totalOrders = totalOrdersResult[0]?.totalOrders || 0;
    const totalCustomers = totalCustomersResult[0]?.totalCustomers || 0;
    const totalProducts = totalProductsResult[0]?.totalProducts || 0;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Format orders by status with proper handling of null status
    const ordersByStatus = ordersByStatusResult.reduce((acc, item) => {
      const status = item.status || 'unknown';
      acc[status] = item.count || 0;
      return acc;
    }, {} as Record<string, number>);

    // Format monthly revenue trends
    const monthlyRevenue = monthlyRevenueResult.map(item => ({
      month: item.month || 'unknown',
      revenue: item.revenue || 0
    }));

    // Format top selling products
    const topSellingProducts = topSellingProductsResult.map(item => ({
      productId: item.productId,
      productName: item.productName || 'Unknown Product',
      totalQuantity: item.totalQuantity || 0,
      totalRevenue: item.totalRevenue || 0
    }));

    // Format recent analytics
    const recentAnalytics = recentAnalyticsResult.map(item => ({
      id: item.id,
      metricName: item.metricName,
      value: item.value || 0,
      date: item.date,
      createdAt: item.createdAt
    }));

    // Prepare dashboard response
    const dashboard = {
      overview: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue: Number(averageOrderValue.toFixed(2))
      },
      ordersByStatus,
      monthlyRevenue,
      topSellingProducts,
      recentAnalytics
    };

    return NextResponse.json(dashboard, { status: 200 });

  } catch (error) {
    console.error('GET dashboard analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard analytics',
      code: 'DASHBOARD_FETCH_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metricName, value, date } = body;

    // Validate required fields
    if (!metricName) {
      return NextResponse.json({ 
        error: "Metric name is required",
        code: "MISSING_METRIC_NAME" 
      }, { status: 400 });
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ 
        error: "Value is required",
        code: "MISSING_VALUE" 
      }, { status: 400 });
    }

    if (isNaN(Number(value))) {
      return NextResponse.json({ 
        error: "Value must be a valid number",
        code: "INVALID_VALUE" 
      }, { status: 400 });
    }

    // Prepare analytics data
    const analyticsData = {
      metricName: metricName.trim(),
      value: Number(value),
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // Insert new analytics record
    const newAnalytics = await db.insert(analytics)
      .values(analyticsData)
      .returning();

    return NextResponse.json(newAnalytics[0], { status: 201 });

  } catch (error) {
    console.error('POST analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to create analytics record',
      code: 'ANALYTICS_CREATE_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid analytics ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if analytics record exists
    const existingAnalytics = await db.select()
      .from(analytics)
      .where(eq(analytics.id, parseInt(id)))
      .limit(1);

    if (existingAnalytics.length === 0) {
      return NextResponse.json({ 
        error: 'Analytics record not found',
        code: 'ANALYTICS_NOT_FOUND'
      }, { status: 404 });
    }

    // Delete analytics record
    const deleted = await db.delete(analytics)
      .where(eq(analytics.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Analytics record deleted successfully',
      deletedRecord: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete analytics record',
      code: 'ANALYTICS_DELETE_ERROR'
    }, { status: 500 });
  }
}