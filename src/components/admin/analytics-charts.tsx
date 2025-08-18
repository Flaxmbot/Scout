"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartsProps {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders?: number;
  }>;
  ordersByStatus: Record<string, number>;
  topSellingProducts: Array<{
    productId: string | number;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export default function AnalyticsCharts({ 
  monthlyRevenue, 
  ordersByStatus, 
  topSellingProducts 
}: AnalyticsChartsProps) {
  // Revenue trend chart options
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Revenue & Orders Trend',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const revenueChartData = {
    labels: monthlyRevenue.map(item => item.month),
    datasets: [
      {
        type: 'line' as const,
        label: 'Revenue',
        data: monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Orders',
        data: monthlyRevenue.map(item => item.orders || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  // Order status doughnut chart
  const orderStatusChartData = {
    labels: Object.keys(ordersByStatus).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [
      {
        data: Object.values(ordersByStatus),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)', // pending - yellow
          'rgba(59, 130, 246, 0.8)', // processing - blue
          'rgba(168, 85, 247, 0.8)', // shipped - purple
          'rgba(34, 197, 94, 0.8)',  // delivered - green
          'rgba(239, 68, 68, 0.8)',  // cancelled - red
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)', 
          'rgba(168, 85, 247, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const orderStatusChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Order Status Distribution',
      },
    },
  };

  // Top products bar chart
  const topProductsChartData = {
    labels: topSellingProducts.slice(0, 5).map(product => 
      product.productName.length > 20 
        ? product.productName.substring(0, 20) + '...' 
        : product.productName
    ),
    datasets: [
      {
        label: 'Revenue ($)',
        data: topSellingProducts.slice(0, 5).map(product => product.totalRevenue),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Quantity Sold',
        data: topSellingProducts.slice(0, 5).map(product => product.totalQuantity),
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topProductsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top Selling Products',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Revenue Trend Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue & Orders Trend</CardTitle>
          <CardDescription>Track your sales performance over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Current distribution of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={orderStatusChartData} options={orderStatusChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Best performing products by revenue and quantity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={topProductsChartData} options={topProductsChartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}