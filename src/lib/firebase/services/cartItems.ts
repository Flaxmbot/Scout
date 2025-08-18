import { adminDB } from '../admin';
import { CartItem, COLLECTIONS } from '../types';
import type { DocumentSnapshot, QueryDocumentSnapshot, Query, CollectionReference } from 'firebase-admin/firestore';

export class CartItemsService {
  static async getById(id: string): Promise<CartItem | null> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.CART_ITEMS).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as CartItem;
      }
      return null;
    } catch (error) {
      console.error('Error getting cart item:', error);
      throw error;
    }
  }

  static async getAll(options: {
    limit?: number;
    offset?: number;
    sessionId?: string;
    productId?: string;
    lastDoc?: DocumentSnapshot;
  } = {}): Promise<{ cartItems: CartItem[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    try {
      const {
        limit: queryLimit = 10,
        sessionId,
        productId,
        lastDoc
      } = options;

      let q: Query | CollectionReference = adminDB.collection(COLLECTIONS.CART_ITEMS);

      // Add filters
      if (sessionId) {
        q = q.where('sessionId', '==', sessionId);
      }

      if (productId) {
        q = q.where('productId', '==', productId);
      }

      // Add sorting
      q = q.orderBy('createdAt', 'desc');

      // Add pagination
      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      q = q.limit(queryLimit + 1); // Get one extra to check if there are more

      const snapshot = await q.get();
      
      const cartItems: CartItem[] = [];
      const docs = snapshot.docs;
      let hasMore = false;

      if (docs.length > queryLimit) {
        hasMore = true;
        docs.pop(); // Remove the extra document
      }

      docs.forEach((doc: QueryDocumentSnapshot) => {
        cartItems.push({ id: doc.id, ...doc.data() } as CartItem);
      });

      return {
        cartItems,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
        hasMore
      };
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  }

  static async getBySession(sessionId: string): Promise<CartItem[]> {
    try {
      const q = adminDB.collection(COLLECTIONS.CART_ITEMS)
        .where('sessionId', '==', sessionId)
        .orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      const cartItems: CartItem[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        cartItems.push({ id: doc.id, ...doc.data() } as CartItem);
      });

      return cartItems;
    } catch (error) {
      console.error('Error getting cart items by session:', error);
      throw error;
    }
  }

  static async create(cartItemData: Omit<CartItem, 'id' | 'createdAt'>): Promise<CartItem> {
    try {
      // Verify product exists
      const productDoc = await adminDB.collection(COLLECTIONS.PRODUCTS).doc(cartItemData.productId).get();
      if (!productDoc.exists) {
        throw new Error('Product not found');
      }

      const docRef = await adminDB.collection(COLLECTIONS.CART_ITEMS).add({
        ...cartItemData,
        createdAt: new Date().toISOString()
      });

      const newDoc = await docRef.get();
      return { id: newDoc.id, ...newDoc.data() } as CartItem;
    } catch (error) {
      console.error('Error creating cart item:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Omit<CartItem, 'id' | 'createdAt'>>): Promise<CartItem> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.CART_ITEMS).doc(id);
      
      // Check if document exists
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Cart item not found');
      }

      // If updating productId, verify the product exists
      if (updates.productId) {
        const productDoc = await adminDB.collection(COLLECTIONS.PRODUCTS).doc(updates.productId).get();
        if (!productDoc.exists) {
          throw new Error('Product not found');
        }
      }

      await docRef.update(updates);

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as CartItem;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<CartItem> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.CART_ITEMS).doc(id);
      
      // Get document before deleting
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Cart item not found');
      }

      const cartItemData = { id: docSnap.id, ...docSnap.data() } as CartItem;
      await docRef.delete();

      return cartItemData;
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw error;
    }
  }

  static async clearSession(sessionId: string): Promise<void> {
    try {
      const q = adminDB.collection(COLLECTIONS.CART_ITEMS)
        .where('sessionId', '==', sessionId);

      const snapshot = await q.get();
      const batch = adminDB.batch();

      snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error clearing cart session:', error);
      throw error;
    }
  }

  static async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    try {
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      return await this.update(id, { quantity });
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }
}