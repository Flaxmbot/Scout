import { adminDB } from '../admin';
import { Category, COLLECTIONS } from '../types';
import type { DocumentSnapshot, QueryDocumentSnapshot, Query, CollectionReference } from 'firebase-admin/firestore';

export class CategoriesService {
  static async getById(id: string): Promise<Category | null> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.CATEGORIES).doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() } as Category;
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  static async getBySlug(slug: string): Promise<Category | null> {
    try {
      const q = adminDB.collection(COLLECTIONS.CATEGORIES)
        .where('slug', '==', slug)
        .limit(1);

      const snapshot = await q.get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Category;
      }
      return null;
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw error;
    }
  }

  static async getAll(options: {
    limit?: number;
    offset?: number;
    lastDoc?: DocumentSnapshot;
  } = {}): Promise<{ categories: Category[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    try {
      const {
        limit: queryLimit = 10,
        lastDoc
      } = options;

      let q: Query | CollectionReference = adminDB.collection(COLLECTIONS.CATEGORIES);

      // Add sorting
      q = q.orderBy('createdAt', 'desc');

      // Add pagination
      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      q = q.limit(queryLimit + 1); // Get one extra to check if there are more

      const snapshot = await q.get();
      
      const categories: Category[] = [];
      const docs = snapshot.docs;
      let hasMore = false;

      if (docs.length > queryLimit) {
        hasMore = true;
        docs.pop(); // Remove the extra document
      }

      docs.forEach((doc: QueryDocumentSnapshot) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });

      return {
        categories,
        lastDoc: docs.length > 0 ? docs[docs.length - 1] : undefined,
        hasMore
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  static async create(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    try {
      // Check if slug already exists
      const existingCategory = await this.getBySlug(categoryData.slug);
      if (existingCategory) {
        throw new Error('Category with this slug already exists');
      }

      const docRef = await adminDB.collection(COLLECTIONS.CATEGORIES).add({
        ...categoryData,
        createdAt: new Date().toISOString()
      });

      const newDoc = await docRef.get();
      return { id: newDoc.id, ...newDoc.data() } as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.CATEGORIES).doc(id);
      
      // Check if document exists
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Category not found');
      }

      // If updating slug, check if new slug already exists
      if (updates.slug) {
        const existingCategory = await this.getBySlug(updates.slug);
        if (existingCategory && existingCategory.id !== id) {
          throw new Error('Category with this slug already exists');
        }
      }

      await docRef.update(updates);

      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<Category> {
    try {
      const docRef = adminDB.collection(COLLECTIONS.CATEGORIES).doc(id);
      
      // Get document before deleting
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Category not found');
      }

      // Check if category has products
      const productsQuery = adminDB.collection(COLLECTIONS.PRODUCTS)
        .where('category', '==', docSnap.data()?.name)
        .limit(1);
      
      const productsSnapshot = await productsQuery.get();
      if (!productsSnapshot.empty) {
        throw new Error('Cannot delete category that has products. Please remove or reassign products first.');
      }

      const categoryData = { id: docSnap.id, ...docSnap.data() } as Category;
      await docRef.delete();

      return categoryData;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  static async list(): Promise<Category[]> {
    try {
      const q = adminDB.collection(COLLECTIONS.CATEGORIES)
        .orderBy('name', 'asc');

      const snapshot = await q.get();
      const categories: Category[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });

      return categories;
    } catch (error) {
      console.error('Error listing categories:', error);
      throw error;
    }
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  static async createWithAutoSlug(categoryData: Omit<Category, 'id' | 'createdAt' | 'slug'>): Promise<Category> {
    try {
      let baseSlug = this.generateSlug(categoryData.name);
      let slug = baseSlug;
      let counter = 1;

      // Check if slug exists and increment counter if needed
      while (await this.getBySlug(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return this.create({
        ...categoryData,
        slug
      });
    } catch (error) {
      console.error('Error creating category with auto slug:', error);
      throw error;
    }
  }
}