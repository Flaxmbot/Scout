import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, categories, orderItems, orders } from '@/db/schema';
import { eq, like, and, or, desc, asc, sum, count, sql, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const period = searchParams.get('period') || '30';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const minStock = parseInt(searchParams.get('minStock') || '10');

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Best Selling Products with Revenue
    let bestSellersQuery = db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        category: products.category,
        quantitySold: sum(orderItems.quantity).as('quantitySold'),
        revenue: sum(sql`${orderItems.quantity} * ${orderItems.price}`).as('revenue'),
        averagePrice: sql`AVG(${orderItems.price})`.as('averagePrice'),
        stockQuantity: products.stockQuantity,
        price: products.price,
        salePrice: products.salePrice
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          gte(orders.createdAt, startDateStr),
          lte(orders.createdAt, endDateStr),
          category ? eq(products.category, category) : undefined
        )
      )
      .groupBy(orderItems.productId, products.name, products.category, products.stockQuantity, products.price, products.salePrice)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.price})`))
      .limit(limit);

    const bestSellers = await bestSellersQuery;

    // Products by Category Performance
    let categoryPerformanceQuery = db
      .select({
        category: products.category,
        totalProducts: count(products.id).as('totalProducts'),
        totalRevenue: sum(sql`${orderItems.quantity} * ${orderItems.price}`).as('totalRevenue'),
        totalQuantitySold: sum(orderItems.quantity).as('totalQuantitySold'),
        averagePrice: sql`AVG(${products.price})`.as('averagePrice')
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          orders.createdAt ? gte(orders.createdAt, startDateStr) : undefined,
          orders.createdAt ? lte(orders.createdAt, endDateStr) : undefined,
          category ? eq(products.category, category) : undefined
        )
      )
      .groupBy(products.category)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.price})`));

    const categoryPerformance = await categoryPerformanceQuery;

    // Low Stock Alerts
    let lowStockQuery = db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        stockQuantity: products.stockQuantity,
        price: products.price,
        salePrice: products.salePrice
      })
      .from(products)
      .where(
        and(
          lte(products.stockQuantity, minStock),
          category ? eq(products.category, category) : undefined
        )
      )
      .orderBy(asc(products.stockQuantity))
      .limit(limit);

    const lowStockProducts = await lowStockQuery;

    // Product Status Distribution
    let statusDistributionQuery = db
      .select({
        category: products.category,
        totalProducts: count(products.id).as('totalProducts'),
        featuredProducts: sum(sql`CASE WHEN ${products.isFeatured} = 1 THEN 1 ELSE 0 END`).as('featuredProducts'),
        averageStock: sql`AVG(${products.stockQuantity})`.as('averageStock'),
        outOfStock: sum(sql`CASE WHEN ${products.stockQuantity} = 0 THEN 1 ELSE 0 END`).as('outOfStock')
      })
      .from(products)
      .where(category ? eq(products.category, category) : undefined)
      .groupBy(products.category)
      .orderBy(desc(count(products.id)));

    const statusDistribution = await statusDistributionQuery;

    // Profit Margin Analysis
    const profitAnalysis = bestSellers.map(product => {
      const cost = product.salePrice || product.price;
      const sellingPrice = product.averagePrice || 0;
      const profitMargin = sellingPrice > 0 ? ((sellingPrice - cost) / sellingPrice) * 100 : 0;
      const totalProfit = (product.quantitySold || 0) * (sellingPrice - cost);

      return {
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        quantitySold: product.quantitySold,
        revenue: product.revenue,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        averagePrice: product.averagePrice
      };
    });

    // Inventory Turnover Calculation
    const inventoryTurnover = bestSellers.map(product => {
      const avgInventory = product.stockQuantity || 1;
      const turnoverRate = (product.quantitySold || 0) / avgInventory;
      const daysToSell = avgInventory > 0 ? parseInt(period) / turnoverRate : 0;

      return {
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        stockQuantity: product.stockQuantity,
        quantitySold: product.quantitySold,
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        daysToSell: Math.round(daysToSell * 100) / 100
      };
    });

    // Revenue per Category Summary
    const categoryRevenue = categoryPerformance
      .filter(cat => cat.totalRevenue && cat.totalRevenue > 0)
      .map(cat => ({
        category: cat.category,
        totalProducts: cat.totalProducts,
        totalRevenue: Math.round((cat.totalRevenue || 0) * 100) / 100,
        totalQuantitySold: cat.totalQuantitySold || 0,
        averagePrice: Math.round((cat.averagePrice || 0) * 100) / 100,
        revenuePerProduct: Math.round(((cat.totalRevenue || 0) / (cat.totalProducts || 1)) * 100) / 100
      }));

    // Product Performance Trends (simplified for this period)
    const performanceTrends = bestSellers.slice(0, 10).map(product => ({
      productId: product.productId,
      productName: product.productName,
      category: product.category,
      trend: 'stable',
      quantitySold: product.quantitySold,
      revenue: product.revenue,
      stockLevel: product.stockQuantity,
      isLowStock: (product.stockQuantity || 0) <= minStock
    }));

    const analytics = {
      period: `${period} days`,
      dateRange: {
        start: startDateStr,
        end: endDateStr
      },
      summary: {
        totalCategories: statusDistribution.length,
        totalLowStockItems: lowStockProducts.length,
        totalRevenue: Math.round((categoryRevenue.reduce((sum, cat) => sum + cat.totalRevenue, 0)) * 100) / 100,
        totalProductsSold: categoryRevenue.reduce((sum, cat) => sum + cat.totalQuantitySold, 0)
      },
      bestSellers: bestSellers.map(product => ({
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        quantitySold: product.quantitySold || 0,
        revenue: Math.round((product.revenue || 0) * 100) / 100,
        averagePrice: Math.round((product.averagePrice || 0) * 100) / 100,
        stockQuantity: product.stockQuantity || 0
      })),
      categoryPerformance: categoryRevenue,
      lowStockAlerts: lowStockProducts,
      profitAnalysis: profitAnalysis.filter(p => p.revenue && p.revenue > 0),
      statusDistribution: statusDistribution.map(status => ({
        category: status.category,
        totalProducts: status.totalProducts || 0,
        featuredProducts: status.featuredProducts || 0,
        averageStock: Math.round((status.averageStock || 0) * 100) / 100,
        outOfStock: status.outOfStock || 0,
        stockHealthPercentage: Math.round(((status.totalProducts - status.outOfStock) / status.totalProducts * 100) * 100) / 100
      })),
      inventoryTurnover: inventoryTurnover.filter(inv => inv.quantitySold && inv.quantitySold > 0),
      performanceTrends: performanceTrends
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('GET analytics/products error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}