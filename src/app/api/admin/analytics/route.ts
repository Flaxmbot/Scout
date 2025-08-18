import { NextRequest, NextResponse } from 'next/server';
import { OrdersService, ProductsService, CustomersService } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30';
    const category = searchParams.get('category') || 'all';
    const segment = searchParams.get('segment') || 'all';
    const region = searchParams.get('region') || 'all';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Calculate date range
    let startDate = new Date();
    let endDate = new Date();

    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      endDate = new Date(toDate);
    } else {
      const days = parseInt(dateRange);
      startDate.setDate(startDate.getDate() - days);
    }

    // Fetch all data in parallel
    const [ordersResult, productsResult, customersResult] = await Promise.all([
      OrdersService.getAll({ limit: 1000 }),
      ProductsService.getAll({ limit: 1000 }),
      CustomersService.getAll({ limit: 1000 })
    ]);

    const orders = ordersResult.orders;
    const products = productsResult.products;
    const customers = customersResult; // CustomersService returns array directly

    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Calculate overview metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const totalCustomers = customers.length;
    
    // Calculate previous period for comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevEndDate = new Date(endDate);
    prevEndDate.setDate(prevEndDate.getDate() - periodDays);

    const prevOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= prevStartDate && orderDate <= prevEndDate;
    });

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const prevOrdersCount = prevOrders.length;
    
    // Calculate changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrdersCount > 0 ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 : 0;
    const customersChange = 15.3; // Mock data for now
    const conversionRate = totalCustomers > 0 ? (totalOrders / (totalCustomers * 10)) * 100 : 0; // Approximate
    const conversionChange = 2.1; // Mock data

    // Generate daily revenue data
    const revenueData = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === currentDate.toDateString();
      });
      
      revenueData.push({
        date: currentDate.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: dayOrders.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate top products data (simulate based on products)
    const topProducts = products.slice(0, 10).map((product, index) => {
      const baseSales = Math.floor(Math.random() * 100) + 50;
      const growth = (Math.random() - 0.5) * 40; // -20% to +20%
      
      return {
        id: product.id,
        name: product.name,
        sales: baseSales,
        revenue: baseSales * product.price,
        growth: parseFloat(growth.toFixed(1))
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Generate customer growth data
    const customerGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      customerGrowth.push({
        date: date.toISOString().split('T')[0],
        newCustomers: Math.floor(Math.random() * 20) + 5,
        returningCustomers: Math.floor(Math.random() * 15) + 10
      });
    }

    // Order status distribution
    const orderStatus = [
      { name: 'Pending', value: filteredOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
      { name: 'Processing', value: filteredOrders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
      { name: 'Shipped', value: filteredOrders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
      { name: 'Delivered', value: filteredOrders.filter(o => o.status === 'delivered').length, color: '#10b981' },
      { name: 'Cancelled', value: filteredOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
    ];

    // Geographic data (mock)
    const geographicData = [
      { region: 'North America', sales: Math.floor(totalOrders * 0.45), revenue: Math.floor(totalRevenue * 0.45) },
      { region: 'Europe', sales: Math.floor(totalOrders * 0.30), revenue: Math.floor(totalRevenue * 0.30) },
      { region: 'Asia', sales: Math.floor(totalOrders * 0.20), revenue: Math.floor(totalRevenue * 0.20) },
      { region: 'Other', sales: Math.floor(totalOrders * 0.05), revenue: Math.floor(totalRevenue * 0.05) }
    ];

    // Seasonal trends (last 12 months)
    const seasonalTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = months[date.getMonth()];
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      });

      seasonalTrends.push({
        month: monthName,
        sales: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      });
    }

    const analyticsData = {
      overview: {
        revenue: Math.round(totalRevenue),
        revenueChange: Math.round(revenueChange * 10) / 10,
        orders: totalOrders,
        ordersChange: Math.round(ordersChange * 10) / 10,
        customers: totalCustomers,
        customersChange: customersChange,
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionChange: conversionChange
      },
      revenueData,
      topProducts,
      customerGrowth,
      orderStatus,
      geographicData,
      seasonalTrends
    };

    return NextResponse.json(analyticsData, { status: 200 });

  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
      code: 'ANALYTICS_FETCH_ERROR'
    }, { status: 500 });
  }
}