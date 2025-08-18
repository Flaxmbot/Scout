import { adminDB } from '../admin';
import { Product, COLLECTIONS } from '../types';
import type { DocumentSnapshot, QueryDocumentSnapshot, Query, CollectionReference } from 'firebase-admin/firestore';

export class ProductsService {
  static async getById(id: string): Promise<Product | null> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.PRODUCTS).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  static async getByIdOriginal(id: string): Promise<Product | null> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.PRODUCTS).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  static async getAll(options: {
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    color?: string;
    size?: string;
    isFeatured?: boolean;
    sort?: 'name' | 'price' | 'category' | 'createdAt';
    order?: 'asc' | 'desc';
    lastDoc?: QueryDocumentSnapshot;
  } = {}): Promise<{ products: Product[]; lastDoc?: QueryDocumentSnapshot; hasMore: boolean }> {
    try {
      const {
        limit: queryLimit = 10,
        search,
        category,
        color,
        size,
        isFeatured,
        sort = 'createdAt',
        order: sortOrder = 'desc',
        lastDoc
      } = options;

      let q: Query | CollectionReference = adminDB.collection(COLLECTIONS.PRODUCTS);

      // Add filters
      if (search) {
        // Note: Firestore doesn't support full-text search natively
        // This is a simple starts-with search for name
        q = q.where('name', '>=', search).where('name', '<=', search + '\uf8ff');
      }

      if (category) {
        q = q.where('category', '==', category);
      }

      if (color) {
        q = q.where('color', '==', color);
      }

      if (size) {
        q = q.where('size', '==', size);
      }

      if (isFeatured !== undefined) {
        q = q.where('isFeatured', '==', isFeatured);
      }

      // Add sorting
      const sortField = sort === 'createdAt' ? 'createdAt' : sort;
      q = q.orderBy(sortField, sortOrder);

      // Add pagination
      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      q = q.limit(queryLimit + 1); // Get one extra to check if there are more

      const snapshot = await q.get();
      
      const products: Product[] = [];
      const docs = snapshot.docs;
      let hasMore = false;

      if (docs.length > queryLimit) {
        hasMore = true;
        docs.pop(); // Remove the extra document
      }

      docs.forEach((doc: QueryDocumentSnapshot) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      return {
        products,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
        hasMore
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  static async create(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const docRef = await adminDB.collection(COLLECTIONS.PRODUCTS).add({
        ...productData,
        createdAt: new Date().toISOString()
      });

      const newDoc = await docRef.get();
      return { id: newDoc.id, ...newDoc.data() } as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.PRODUCTS).doc(id);
      
      // Check if document exists
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Product not found');
      }

      await docRef.update(updates);

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<Product> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.PRODUCTS).doc(id);
      
      // Get document before deleting
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Product not found');
      }

      const productData = { id: docSnap.id, ...docSnap.data() } as Product;
      await docRef.delete();

      return productData;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async getByCategory(category: string): Promise<Product[]> {
    try {
      const q = adminDB.collection(COLLECTIONS.PRODUCTS)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      const products: Product[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  static async getFeatured(): Promise<Product[]> {
    try {
      const q = adminDB.collection(COLLECTIONS.PRODUCTS)
        .where('isFeatured', '==', true)
        .orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      const products: Product[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }
}