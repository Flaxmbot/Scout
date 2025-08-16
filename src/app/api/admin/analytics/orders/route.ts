import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'day';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const statusFilter = searchParams.get('status');

    // Validate period parameter
    if (!['day', 'week', 'month'].includes(period)) {
      return NextResponse.json({
        error: "Invalid period. Must be 'day', 'week', or 'month'",
        code: "INVALID_PERIOD"
      }, { status: 400 });
    }

    // Build date filter conditions
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(orders.createdAt, startDate));
    }
    if (endDate) {
      dateConditions.push(lte(orders.createdAt, endDate));
    }
    if (statusFilter) {
      dateConditions.push(eq(orders.status, statusFilter));
    }

    const whereCondition = dateConditions.length > 0 ? and(...dateConditions) : undefined;

    // 1. Order trends over time
    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = "date(created_at)";
        break;
      case 'week':
        dateFormat = "date(created_at, 'weekday 0', '-6 days')";
        break;
      case 'month':
        dateFormat = "date(created_at, 'start of month')";
        break;
    }

    const orderTrends = await db
      .select({
        period: sql`${sql.raw(dateFormat)}`.as('period'),
        orderCount: sql<number>`count(*)`.as('orderCount'),
        totalRevenue: sql<number>`sum(total_amount)`.as('totalRevenue'),
        averageOrderValue: sql<number>`avg(total_amount)`.as('averageOrderValue')
      })
      .from(orders)
      .where(whereCondition)
      .groupBy(sql`${sql.raw(dateFormat)}`)
      .orderBy(sql`${sql.raw(dateFormat)}`);

    // 2. Orders by status breakdown
    const statusBreakdown = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`.as('count'),
        totalRevenue: sql<number>`sum(total_amount)`.as('totalRevenue')
      })
      .from(orders)
      .where(whereCondition)
      .groupBy(orders.status);

    const totalOrders = statusBreakdown.reduce((sum, item) => sum + item.count, 0);
    const statusWithPercentages = statusBreakdown.map(item => ({
      ...item,
      percentage: totalOrders > 0 ? Math.round((item.count / totalOrders) * 100 * 100) / 100 : 0
    }));

    // 3. Revenue by time period (same as order trends but focused on revenue)
    const revenueByPeriod = orderTrends.map(trend => ({
      period: trend.period,
      revenue: trend.totalRevenue || 0,
      orderCount: trend.orderCount
    }));

    // 4. Average order value trends
    const aovTrends = orderTrends.map(trend => ({
      period: trend.period,
      averageOrderValue: trend.averageOrderValue || 0,
      orderCount: trend.orderCount
    }));

    // 5. Peak order times/days
    const peakOrderTimes = await db
      .select({
        hour: sql<number>`cast(strftime('%H', created_at) as integer)`.as('hour'),
        orderCount: sql<number>`count(*)`.as('orderCount')
      })
      .from(orders)
      .where(whereCondition)
      .groupBy(sql`strftime('%H', created_at)`)
      .orderBy(desc(sql`count(*)`));

    const peakOrderDays = await db
      .select({
        dayOfWeek: sql<number>`cast(strftime('%w', created_at) as integer)`.as('dayOfWeek'),
        dayName: sql<string>`
          case strftime('%w', created_at)
            when '0' then 'Sunday'
            when '1' then 'Monday'
            when '2' then 'Tuesday'
            when '3' then 'Wednesday'
            when '4' then 'Thursday'
            when '5' then 'Friday'
            when '6' then 'Saturday'
          end
        `.as('dayName'),
        orderCount: sql<number>`count(*)`.as('orderCount')
      })
      .from(orders)
      .where(whereCondition)
      .groupBy(sql`strftime('%w', created_at)`)
      .orderBy(desc(sql`count(*)`));

    // 6. Order fulfillment metrics
    const fulfillmentMetrics = await db
      .select({
        status: orders.status,
        averageDaysToStatus: sql<number>`
          avg(
            case 
              when status != 'pending' then
                julianday('now') - julianday(created_at)
              else null
            end
          )
        `.as('averageDaysToStatus'),
        count: sql<number>`count(*)`.as('count')
      })
      .from(orders)
      .where(whereCondition)
      .groupBy(orders.status);

    // Calculate overall fulfillment time for delivered orders
    const deliveredOrders = await db
      .select({
        averageFulfillmentDays: sql<number>`
          avg(julianday('now') - julianday(created_at))
        `.as('averageFulfillmentDays'),
        count: sql<number>`count(*)`.as('count')
      })
      .from(orders)
      .where(
        whereCondition 
          ? and(whereCondition, eq(orders.status, 'delivered'))
          : eq(orders.status, 'delivered')
      );

    // Summary statistics
    const summaryStats = await db
      .select({
        totalOrders: sql<number>`count(*)`.as('totalOrders'),
        totalRevenue: sql<number>`sum(total_amount)`.as('totalRevenue'),
        averageOrderValue: sql<number>`avg(total_amount)`.as('averageOrderValue'),
        minOrderValue: sql<number>`min(total_amount)`.as('minOrderValue'),
        maxOrderValue: sql<number>`max(total_amount)`.as('maxOrderValue')
      })
      .from(orders)
      .where(whereCondition);

    const analytics = {
      summary: {
        totalOrders: summaryStats[0]?.totalOrders || 0,
        totalRevenue: summaryStats[0]?.totalRevenue || 0,
        averageOrderValue: summaryStats[0]?.averageOrderValue || 0,
        minOrderValue: summaryStats[0]?.minOrderValue || 0,
        maxOrderValue: summaryStats[0]?.maxOrderValue || 0,
        period,
        dateRange: {
          startDate: startDate || 'all time',
          endDate: endDate || 'now'
        }
      },
      orderTrends: orderTrends.map(trend => ({
        period: trend.period,
        orderCount: trend.orderCount,
        totalRevenue: trend.totalRevenue || 0,
        averageOrderValue: trend.averageOrderValue || 0
      })),
      statusBreakdown: statusWithPercentages,
      revenueByPeriod,
      averageOrderValueTrends: aovTrends,
      peakTimes: {
        hours: peakOrderTimes.slice(0, 5), // Top 5 peak hours
        daysOfWeek: peakOrderDays
      },
      fulfillmentMetrics: {
        byStatus: fulfillmentMetrics.map(metric => ({
          status: metric.status,
          averageDaysToStatus: Math.round((metric.averageDaysToStatus || 0) * 100) / 100,
          count: metric.count
        })),
        delivered: {
          averageFulfillmentDays: Math.round((deliveredOrders[0]?.averageFulfillmentDays || 0) * 100) / 100,
          count: deliveredOrders[0]?.count || 0
        }
      }
    };

    return NextResponse.json(analytics, { status: 200 });

  } catch (error) {
    console.error('GET analytics/orders error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: "POST method not supported for analytics endpoint",
    code: "METHOD_NOT_ALLOWED"
  }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    error: "PUT method not supported for analytics endpoint",
    code: "METHOD_NOT_ALLOWED"
  }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: "DELETE method not supported for analytics endpoint",
    code: "METHOD_NOT_ALLOWED"
  }, { status: 405 });
}