import { adminDB } from '../admin';
import { COLLECTIONS, User, Order } from '../types';

export interface CustomerAnalytics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  segment: 'VIP' | 'Loyal' | 'Active' | 'New';
}

export interface Customer extends User {
  analytics: CustomerAnalytics;
  phone?: string;
  address?: string;
  tags?: string[];
  notes?: string;
}

export class CustomersService {
  static async getAll(options: {
    limit?: number;
    offset?: number;
    segment?: string;
    searchQuery?: string;
  } = {}): Promise<Customer[]> {
    try {
      const { limit = 50, offset = 0, segment, searchQuery } = options;
      
      // Get all users with role 'user'
      let usersQuery = adminDB
        .collection(COLLECTIONS.USERS)
        .where('role', '==', 'user')
        .limit(limit)
        .offset(offset);
      
      const usersSnapshot = await usersQuery.get();
      const customers: Customer[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as User;
        
        // Get analytics for this customer
        const analytics = await this.getCustomerAnalytics(userData.id);
        
        const customer: Customer = {
          ...userData,
          analytics,
          // Add additional customer-specific fields if needed
          phone: userData.phone,
          address: userData.address,
          tags: userData.tags || [],
          notes: userData.notes
        };

        // Apply filters
        if (segment && analytics.segment !== segment) {
          continue;
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            userData.name?.toLowerCase().includes(query) ||
            userData.email?.toLowerCase().includes(query) ||
            userData.phone?.toLowerCase().includes(query);
          
          if (!matchesSearch) {
            continue;
          }
        }
        
        customers.push(customer);
      }
      
      return customers;
    } catch (error) {
      console.error('Error getting customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  static async getById(customerId: string): Promise<Customer | null> {
    try {
      const userDoc = await adminDB
        .collection(COLLECTIONS.USERS)
        .doc(customerId)
        .get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      const userData = userDoc.data() as User;
      
      // Only return if user is a customer
      if (userData.role !== 'user') {
        return null;
      }
      
      const analytics = await this.getCustomerAnalytics(customerId);
      
      return {
        ...userData,
        analytics,
        phone: userData.phone,
        address: userData.address,
        tags: userData.tags || [],
        notes: userData.notes
      };
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  static async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    try {
      // Get all orders for this customer
      const ordersSnapshot = await adminDB
        .collection(COLLECTIONS.ORDERS)
        .where('userId', '==', customerId)
        .get();
      
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
      
      if (orders.length === 0) {
        return {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          segment: 'New'
        };
      }

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalSpent / totalOrders;
      
      // Sort orders by date to get first and last order dates
      const sortedOrders = orders.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      const firstOrderDate = sortedOrders[0]?.createdAt;
      const lastOrderDate = sortedOrders[sortedOrders.length - 1]?.createdAt;
      
      // Determine segment based on spending and order history
      let segment: CustomerAnalytics['segment'] = 'New';
      
      if (totalSpent >= 1000 && totalOrders >= 5) {
        segment = 'VIP';
      } else if (totalSpent >= 500 && totalOrders >= 3) {
        segment = 'Loyal';
      } else if (totalOrders >= 1) {
        segment = 'Active';
      }
      
      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        firstOrderDate,
        segment
      };
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        segment: 'New'
      };
    }
  }

  static async updateCustomer(customerId: string, updates: {
    phone?: string;
    address?: string;
    tags?: string[];
    notes?: string;
  }): Promise<Customer | null> {
    try {
      const userRef = adminDB.collection(COLLECTIONS.USERS).doc(customerId);
      
      await userRef.update({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      return await this.getById(customerId);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  static async getCustomerOrders(customerId: string, limit: number = 10): Promise<Order[]> {
    try {
      const ordersSnapshot = await adminDB
        .collection(COLLECTIONS.ORDERS)
        .where('userId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return ordersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }) as Order);
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  }

  static async getSegmentStats(): Promise<Record<string, number>> {
    try {
      const usersSnapshot = await adminDB
        .collection(COLLECTIONS.USERS)
        .where('role', '==', 'user')
        .get();
      
      const stats: Record<string, number> = {
        'VIP': 0,
        'Loyal': 0,
        'Active': 0,
        'New': 0
      };
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as User;
        const analytics = await this.getCustomerAnalytics(userData.id);
        stats[analytics.segment]++;
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting segment stats:', error);
      return { 'VIP': 0, 'Loyal': 0, 'Active': 0, 'New': 0 };
    }
  }
}