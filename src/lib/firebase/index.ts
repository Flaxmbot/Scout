// Client-side Firebase exports
export { db, auth, storage, analytics } from './config';

// Server-side Firebase Admin exports
export { adminDB, adminAuth, adminStorage } from './admin';

// Types and constants
export * from './types';

// Services
export { AuthService } from './services/auth';
export { ProductsService } from './services/products';
export { CartItemsService } from './services/cartItems';
export { OrdersService } from './services/orders';
export { CategoriesService } from './services/categories';
export { CustomersService } from './services/customers';

// Re-export Firebase client SDK functions that are commonly used
export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  endAt,
  endBefore,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

// Auth exports
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';

// Auth types
export type { User as FirebaseUser } from 'firebase/auth';