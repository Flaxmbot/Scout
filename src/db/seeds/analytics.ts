import { db } from '@/db';
import { analytics } from '@/db/schema';

async function main() {
    const today = new Date();
    const sampleAnalytics = [];

    // Daily revenue for last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const createdAt = date.toISOString();

        sampleAnalytics.push({
            metricName: 'daily_revenue',
            value: Number((Math.random() * (3500 - 500) + 500).toFixed(2)),
            date: isoDate,
            createdAt: createdAt,
        });
    }

    // Product performance metrics
    const productCategories = ['Electronics', 'Apparel', 'Books', 'Home Goods', 'Sports'];
    productCategories.forEach(category => {
        sampleAnalytics.push({
            metricName: `${category}_sales`,
            value: Number((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
        });
        sampleAnalytics.push({
            metricName: `${category}_units_sold`,
            value: Math.floor(Math.random() * (500 - 50) + 50),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
        });
        sampleAnalytics.push({
            metricName: `${category}_conversion_rate`,
            value: Number((Math.random() * (0.08 - 0.01) + 0.01).toFixed(4)), // 1-8%
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
        });
    });

    // Customer engagement metrics (for today)
    sampleAnalytics.push({
        metricName: 'new_signups',
        value: Math.floor(Math.random() * (50 - 5) + 5),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'returning_customers',
        value: Math.floor(Math.random() * (200 - 20) + 20),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'customer_satisfaction_score',
        value: Number((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });

    // Order fulfillment metrics (for today)
    sampleAnalytics.push({
        metricName: 'average_processing_time_hours',
        value: Number((Math.random() * (48 - 12) + 12).toFixed(1)),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'delivery_rate_on_time',
        value: Number((Math.random() * (0.99 - 0.85) + 0.85).toFixed(4)), // 85-99%
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });

    // Inventory alerts and stock level tracking (current state)
    sampleAnalytics.push({
        metricName: 'low_stock_alerts',
        value: Math.floor(Math.random() * (15 - 0) + 0),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'out_of_stock_products',
        value: Math.floor(Math.random() * (5 - 0) + 0),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });

    // System settings as analytics entries (example only)
    sampleAnalytics.push({
        metricName: 'site_dark_mode_enabled',
        value: 1, // 1 for true, 0 for false
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'payment_gateway_status',
        value: 1, // 1 for operational, 0 for downtime
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });

    // Monthly trend data for dashboard charts (last 6 months)
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const isoDate = date.toISOString().split('T')[0].substring(0, 7) + '-01'; // YYYY-MM-01
        const createdAt = date.toISOString();

        sampleAnalytics.push({
            metricName: 'monthly_gross_sales',
            value: Number((Math.random() * (150000 - 50000) + 50000).toFixed(2)),
            date: isoDate,
            createdAt: createdAt,
        });
        sampleAnalytics.push({
            metricName: 'monthly_new_users',
            value: Math.floor(Math.random() * (1000 - 100) + 100),
            date: isoDate,
            createdAt: createdAt,
        });
        sampleAnalytics.push({
            metricName: 'monthly_order_count',
            value: Math.floor(Math.random() * (2000 - 200) + 200),
            date: isoDate,
            createdAt: createdAt,
        });
    }

    // Key performance indicators for business insights (current)
    sampleAnalytics.push({
        metricName: 'total_orders_today',
        value: Math.floor(Math.random() * (100 - 10) + 10),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'average_order_value',
        value: Number((Math.random() * (250 - 50) + 50).toFixed(2)),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'cart_abandonment_rate',
        value: Number((Math.random() * (0.75 - 0.5) + 0.5).toFixed(4)), // 50-75%
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });
    sampleAnalytics.push({
        metricName: 'website_unique_visitors',
        value: Math.floor(Math.random() * (10000 - 1000) + 1000),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
    });

    await db.insert(analytics).values(sampleAnalytics);

    console.log('✅ Analytics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});