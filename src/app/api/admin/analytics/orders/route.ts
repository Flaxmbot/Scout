import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase/services';

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

    // Fetch all orders
    const ordersResult = await OrdersService.getAll({ limit: 1000 });
    let orders = ordersResult.orders;

    // Apply date filtering if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Apply status filtering if provided
    if (statusFilter) {
      orders = orders.filter(order => order.status === statusFilter);
    }

    // Calculate summary metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const orderValues = orders.map(order => order.totalAmount);
    const minOrderValue = orderValues.length > 0 ? Math.min(...orderValues) : 0;
    const maxOrderValue = orderValues.length > 0 ? Math.max(...orderValues) : 0;

    // Status breakdown
    const statusBreakdown = [
      { status: 'pending', count: orders.filter(o => o.status === 'pending').length },
      { status: 'processing', count: orders.filter(o => o.status === 'processing').length },
      { status: 'shipped', count: orders.filter(o => o.status === 'shipped').length },
      { status: 'delivered', count: orders.filter(o => o.status === 'delivered').length },
      { status: 'cancelled', count: orders.filter(o => o.status === 'cancelled').length }
    ];

    // Generate trend data based on period
    const orderTrends = [];
    const revenueByPeriod = [];
    const averageOrderValueTrends = [];
    
    const now = new Date();
    const periods = period === 'day' ? 30 : period === 'week' ? 12 : 12; // Last 30 days, 12 weeks, or 12 months
    
    for (let i = periods - 1; i >= 0; i--) {
      let periodStart, periodEnd, label;
      
      if (period === 'day') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
        label = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
        periodStart = weekStart;
        periodEnd = new Date(weekStart);
        periodEnd.setDate(weekStart.getDate() + 7);
        label = `Week ${periods - i}`;
      } else { // month
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        label = periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= periodStart && orderDate < periodEnd;
      });
      
      const periodRevenue = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const periodAOV = periodOrders.length > 0 ? periodRevenue / periodOrders.length : 0;
      
      orderTrends.push({ period: label, orders: periodOrders.length });
      revenueByPeriod.push({ period: label, revenue: periodRevenue });
      averageOrderValueTrends.push({ period: label, aov: periodAOV });
    }

    // Peak times analysis
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      hourCounts[orderDate.getHours()]++;
      dayCounts[orderDate.getDay()]++;
    });
    
    const peakTimes = {
      hours: hourCounts.map((count, hour) => ({ hour, count })),
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => ({
        day,
        count: dayCounts[index]
      }))
    };

    // Fulfillment metrics
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const fulfillmentMetrics = {
      byStatus: statusBreakdown,
      delivered: {
        averageFulfillmentDays: 5, // Placeholder - would need order history to calculate real fulfillment time
        count: deliveredOrders.length
      }
    };

    const analytics = {
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        minOrderValue,
        maxOrderValue,
        period,
        dateRange: {
          startDate: startDate || 'all time',
          endDate: endDate || 'now'
        }
      },
      orderTrends,
      statusBreakdown,
      revenueByPeriod,
      averageOrderValueTrends,
      peakTimes,
      fulfillmentMetrics
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