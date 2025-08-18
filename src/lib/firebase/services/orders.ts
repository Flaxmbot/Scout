import { adminDB } from '../admin';
import { Order, OrderItem, COLLECTIONS } from '../types';
import type { DocumentSnapshot, QueryDocumentSnapshot, Query, CollectionReference, Transaction } from 'firebase-admin/firestore';

export class OrdersService {
  static async getById(id: string): Promise<Order | null> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.ORDERS).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  static async getAll(options: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    sort?: 'totalAmount' | 'customerName' | 'status' | 'createdAt';
    order?: 'asc' | 'desc';
    lastDoc?: DocumentSnapshot;
  } = {}): Promise<{ orders: Order[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    try {
      const {
        limit: queryLimit = 10,
        search,
        status,
        sort = 'createdAt',
        order: sortOrder = 'desc',
        lastDoc
      } = options;

      let q: Query | CollectionReference = adminDB.collection(COLLECTIONS.ORDERS);

      // Add filters
      if (search) {
        // Simple search for customer name (Firebase Admin doesn't support OR queries easily)
        // In a real app, you might want to use Algolia or similar for better search
        q = q.where('customerName', '>=', search).where('customerName', '<=', search + '\uf8ff');
      }

      if (status) {
        q = q.where('status', '==', status);
      }

      // Add sorting
      q = q.orderBy(sort, sortOrder);

      // Add pagination
      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      q = q.limit(queryLimit + 1); // Get one extra to check if there are more

      const snapshot = await q.get();
      
      const orders: Order[] = [];
      const docs = snapshot.docs;
      let hasMore = false;

      if (docs.length > queryLimit) {
        hasMore = true;
        docs.pop(); // Remove the extra document
      }

      docs.forEach((doc: QueryDocumentSnapshot) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      return {
        orders,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
        hasMore
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  static async create(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orderData.customerEmail)) {
        throw new Error('Invalid email format');
      }

      const docRef = await adminDB.collection(COLLECTIONS.ORDERS).add({
        ...orderData,
        customerEmail: orderData.customerEmail.toLowerCase(),
        createdAt: new Date().toISOString()
      });

      const newDoc = await docRef.get();
      return { id: newDoc.id, ...newDoc.data() } as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async createWithItems(
    orderData: Omit<Order, 'id' | 'createdAt'>, 
    items: Omit<OrderItem, 'id' | 'orderId'>[]
  ): Promise<{ order: Order; items: OrderItem[] }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orderData.customerEmail)) {
        throw new Error('Invalid email format');
      }

      // Use transaction to ensure atomicity
      const result = await adminDB.runTransaction(async (transaction: Transaction) => {
        // Create the order
        const orderRef = adminDB.collection(COLLECTIONS.ORDERS).doc();
        const orderDataWithTimestamp = {
          ...orderData,
          customerEmail: orderData.customerEmail.toLowerCase(),
          createdAt: new Date().toISOString()
        };
        
        transaction.set(orderRef, orderDataWithTimestamp);

        // Create order items as subcollection
        const createdItems: OrderItem[] = [];
        for (const item of items) {
          const itemRef = orderRef.collection('items').doc();
          const itemData = { ...item, orderId: orderRef.id };
          transaction.set(itemRef, itemData);
          createdItems.push({ id: itemRef.id, ...itemData });
        }

        return {
          order: { id: orderRef.id, ...orderDataWithTimestamp } as Order,
          items: createdItems
        };
      });

      return result;
    } catch (error) {
      console.error('Error creating order with items:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<Order> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.ORDERS).doc(id);
      
      // Check if document exists
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Order not found');
      }

      // Validate email if being updated
      if (updates.customerEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.customerEmail)) {
          throw new Error('Invalid email format');
        }
        updates.customerEmail = updates.customerEmail.toLowerCase();
      }

      await docRef.update(updates);

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: string): Promise<Order> {
    return this.update(id, { status });
  }

  static async delete(id: string): Promise<Order> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.ORDERS).doc(id);
      
      // Get document before deleting
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Order not found');
      }

      const orderData = { id: docSnap.id, ...docSnap.data() } as Order;

      // Use transaction to delete order and all its items
      await adminDB.runTransaction(async (transaction: Transaction) => {
        // Delete all order items
        const itemsSnapshot = await docRef.collection('items').get();
        itemsSnapshot.docs.forEach((itemDoc: QueryDocumentSnapshot) => {
          transaction.delete(itemDoc.ref);
        });

        // Delete the order
        transaction.delete(docRef);
      });

      return orderData;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const itemsRef = adminDB.collection(COLLECTIONS.ORDERS).doc(orderId).collection('items');
      const snapshot = await itemsRef.get();
      
      const items: OrderItem[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        items.push({ id: doc.id, ...doc.data() } as OrderItem);
      });

      return items;
    } catch (error) {
      console.error('Error getting order items:', error);
      throw error;
    }
  }

  static async addOrderItem(orderId: string, item: Omit<OrderItem, 'id' | 'orderId'>): Promise<OrderItem> {
    try {
      // Verify order exists
      const orderDoc = await adminDB.collection(COLLECTIONS.ORDERS).doc(orderId).get();
      if (!orderDoc.exists) {
        throw new Error('Order not found');
      }

      // Verify product exists
      const productDoc = await adminDB.collection(COLLECTIONS.PRODUCTS).doc(item.productId).get();
      if (!productDoc.exists) {
        throw new Error('Product not found');
      }

      const itemRef = adminDB.collection(COLLECTIONS.ORDERS).doc(orderId).collection('items').doc();
      const itemData = { ...item, orderId };
      
      await itemRef.set(itemData);

      return { id: itemRef.id, ...itemData };
    } catch (error) {
      console.error('Error adding order item:', error);
      throw error;
    }
  }

  static async getByCustomerEmail(email: string): Promise<Order[]> {
    try {
      const q = adminDB.collection(COLLECTIONS.ORDERS)
        .where('customerEmail', '==', email.toLowerCase())
        .orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      const orders: Order[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders by customer email:', error);
      throw error;
    }
  }

  static async getByStatus(status: string): Promise<Order[]> {
    try {
      const q = adminDB.collection(COLLECTIONS.ORDERS)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      const orders: Order[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }
}