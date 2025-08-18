import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const type = searchParams.get('type') || 'all'; // all, payment, refund
    const status = searchParams.get('status') || 'all'; // all, completed, pending, failed
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Fetch orders to derive transactions
    const ordersResult = await OrdersService.getAll({ limit: 1000 });
    const orders = ordersResult.orders;

    // Generate transaction data based on orders
    const transactions = orders.flatMap(order => {
      const baseTransaction = {
        id: `tx_${order.id}`,
        orderId: order.id,
        customerId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        amount: order.totalAmount,
        currency: 'USD',
        type: 'payment' as const,
        status: order.status === 'delivered' || order.status === 'shipped' ? 'completed' : 
                order.status === 'cancelled' ? 'failed' : 'pending',
        paymentMethod: Math.random() > 0.7 ? 'PayPal' : 'Credit Card',
        gateway: Math.random() > 0.7 ? 'paypal' : 'stripe',
        gatewayTransactionId: `gw_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: order.createdAt,
        description: `Payment for order #${order.id}`,
        fees: parseFloat((order.totalAmount * 0.029 + 0.30).toFixed(2)), // Typical payment processing fees
        netAmount: parseFloat((order.totalAmount - (order.totalAmount * 0.029 + 0.30)).toFixed(2))
      };

      const transactions = [baseTransaction];

      // Add refund transactions for cancelled orders (30% chance)
      if (order.status === 'cancelled' && Math.random() > 0.7) {
        transactions.push({
          ...baseTransaction,
          id: `tx_refund_${order.id}`,
          type: 'refund' as const,
          amount: -order.totalAmount,
          status: 'completed' as const,
          description: `Refund for order #${order.id}`,
          createdAt: new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day later
          fees: 0,
          netAmount: -order.totalAmount
        });
      }

      return transactions;
    });

    // Apply filters
    let filteredTransactions = transactions;

    if (type !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
    }

    if (status !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.createdAt) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.createdAt) <= to);
    }

    // Sort by creation date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedTransactions = filteredTransactions.slice(0, limit);

    // Calculate summary statistics
    const summary = {
      totalTransactions: filteredTransactions.length,
      totalAmount: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalFees: filteredTransactions.reduce((sum, tx) => sum + tx.fees, 0),
      totalNetAmount: filteredTransactions.reduce((sum, tx) => sum + tx.netAmount, 0),
      completedTransactions: filteredTransactions.filter(tx => tx.status === 'completed').length,
      pendingTransactions: filteredTransactions.filter(tx => tx.status === 'pending').length,
      failedTransactions: filteredTransactions.filter(tx => tx.status === 'failed').length,
      paymentTransactions: filteredTransactions.filter(tx => tx.type === 'payment').length,
      refundTransactions: filteredTransactions.filter(tx => tx.type === 'refund').length
    };

    return NextResponse.json({
      transactions: paginatedTransactions,
      summary,
      hasMore: filteredTransactions.length > limit
    }, { status: 200 });

  } catch (error) {
    console.error('GET transactions error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch transactions',
      code: 'TRANSACTIONS_FETCH_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, type, description } = body;

    // In a real app, this would process the transaction through a payment gateway
    const transaction = {
      id: `tx_${Date.now()}`,
      orderId,
      amount,
      type,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      gateway: 'stripe',
      gatewayTransactionId: `gw_${Math.random().toString(36).substr(2, 9)}`
    };

    // TODO: Implement actual transaction processing
    
    return NextResponse.json(transaction, { status: 201 });

  } catch (error) {
    console.error('POST transaction error:', error);
    return NextResponse.json({ 
      error: 'Failed to create transaction',
      code: 'TRANSACTION_CREATE_ERROR'
    }, { status: 500 });
  }
}