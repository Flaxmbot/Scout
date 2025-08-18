export interface Product {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  category: string;
  color: string;
  size: string;
  stockQuantity: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
}

export interface CartItem {
  id?: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  sessionId: string;
  createdAt: string;
}

export interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

export interface User {
  id?: string;
  email: string;
  password?: string; // Not stored in Firestore when using Firebase Auth
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id?: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface Customer {
  id?: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: any; // JSON object
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  id?: string;
  metricName: string;
  value: number;
  date: string;
  createdAt: string;
}

// Collection names constants
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CART_ITEMS: 'cartItems',
  ORDERS: 'orders',
  ORDER_ITEMS: 'orderItems',
  USERS: 'users',
  SESSIONS: 'sessions',
  CUSTOMERS: 'customers',
  ANALYTICS: 'analytics'
} as const;