import { NextRequest, NextResponse } from 'next/server';
import { ProductsService, CategoriesService } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    // Fetch all products and categories
    const [productsResult, categoriesResult] = await Promise.all([
      ProductsService.getAll({ limit: 1000 }),
      CategoriesService.getAll({ limit: 100 })
    ]);

    const products = productsResult.products;
    const categories = categoriesResult.categories;

    // Calculate summary metrics
    const totalProducts = products.length;
    const averagePrice = products.length > 0 ? 
      products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
    const totalInventoryValue = products.reduce((sum, p) => 
      sum + (p.price * (p.stockQuantity || 0)), 0);
    const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0).length;

    // Category breakdown
    const categoryBreakdown = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category.name);
      const categoryValue = categoryProducts.reduce((sum, p) => 
        sum + (p.price * (p.stockQuantity || 0)), 0);
      
      return {
        category: category.name,
        count: categoryProducts.length,
        value: categoryValue,
        averagePrice: categoryProducts.length > 0 ? 
          categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length : 0
      };
    });

    // Price distribution (price ranges)
    const priceRanges = [
      { range: '₹0-500', min: 0, max: 500 },
      { range: '₹501-1000', min: 501, max: 1000 },
      { range: '₹1001-2000', min: 1001, max: 2000 },
      { range: '₹2001-5000', min: 2001, max: 5000 },
      { range: '₹5000+', min: 5001, max: Infinity }
    ];

    const priceDistribution = priceRanges.map(range => ({
      range: range.range,
      count: products.filter(p => p.price >= range.min && p.price <= range.max).length
    }));

    // Top selling products (placeholder - would need real sales data)
    const topSellingProducts = products
      .sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0))
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stockQuantity || 0,
        estimatedSales: Math.floor(Math.random() * 100) + 1 // Placeholder
      }));

    // Low stock products (stock <= 10)
    const lowStockProducts = products
      .filter(p => (p.stockQuantity || 0) <= 10)
      .sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
      .slice(0, 10)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stockQuantity || 0,
        status: (product.stockQuantity || 0) === 0 ? 'Out of Stock' : 'Low Stock'
      }));

    // Product performance metrics
    const productPerformance = products.slice(0, 20).map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stockQuantity || 0,
      value: product.price * (product.stockQuantity || 0),
      isFeatured: product.isFeatured || false,
      createdAt: product.createdAt
    }));

    const analytics = {
      summary: {
        totalProducts,
        averagePrice,
        totalInventoryValue,
        outOfStockProducts
      },
      categoryBreakdown,
      priceDistribution,
      topSellingProducts,
      lowStockProducts,
      productPerformance
    };

    return NextResponse.json(analytics, { status: 200 });

  } catch (error) {
    console.error('GET product analytics error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}