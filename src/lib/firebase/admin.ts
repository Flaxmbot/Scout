import admin from 'firebase-admin';

// Mock Firebase for development
const mockFirestore = {
  collection: (name: string) => ({
    doc: (id?: string) => ({
      get: async () => ({
        exists: true,
        id: id || 'mock-id',
        data: () => ({
          id: id || 'mock-id',
          name: 'Mock Product',
          price: 599,
          category: 'Mock Category',
          createdAt: new Date().toISOString()
        })
      }),
      set: async (data: any) => ({ id: id || 'mock-id' }),
      update: async (data: any) => ({ id: id || 'mock-id' }),
      delete: async () => ({ id: id || 'mock-id' }),
      collection: (subName: string) => mockFirestore.collection(subName)
    }),
    get: async () => ({
      docs: [
        {
          id: 'mock-id-1',
          data: () => ({
            id: 'mock-id-1',
            name: 'Mock Product 1',
            price: 599,
            category: 'Mock Category',
            createdAt: new Date().toISOString()
          })
        }
      ],
      size: 1,
      empty: false
    }),
    where: () => mockFirestore.collection(name),
    orderBy: () => mockFirestore.collection(name),
    limit: () => mockFirestore.collection(name),
    add: async (data: any) => ({ id: 'new-mock-id' })
  }),
  runTransaction: async (callback: Function) => {
    const transaction = {
      get: async (ref: any) => ({
        exists: true,
        data: () => ({ id: 'mock-id', name: 'Mock Data' })
      }),
      set: (ref: any, data: any) => {},
      update: (ref: any, data: any) => {},
      delete: (ref: any) => {}
    };
    return await callback(transaction);
  }
};

const mockAuth = {
  verifyIdToken: async (token: string) => ({
    uid: 'mock-user-id',
    email: 'test@example.com'
  })
};

const mockStorage = {
  bucket: () => ({
    upload: async () => ({ name: 'mock-file.jpg' })
  })
};

// Initialize Firebase Admin SDK
let adminDB: any;
let adminAuth: any;
let adminStorage: any;
let isFirebaseInitialized = false;

if (!admin.apps.length) {
  try {
    // Use service account credentials
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Use environment variables (Vercel-friendly)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
      
      adminDB = admin.firestore();
      adminAuth = admin.auth();
      adminStorage = admin.storage();
      isFirebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized with environment variables');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account file (local development)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
      });
      
      adminDB = admin.firestore();
      adminAuth = admin.auth();
      adminStorage = admin.storage();
      isFirebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized with service account file');
    } else {
      // Development mode - use mock Firebase if no credentials
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Using mock Firebase for development - set up real Firebase credentials for production');
        adminDB = mockFirestore;
        adminAuth = mockAuth;
        adminStorage = mockStorage;
      } else {
        // During build phase or when credentials are not available
        console.warn('⚠️  Firebase Admin credentials not found - using mock Firebase');
        adminDB = mockFirestore;
        adminAuth = mockAuth;
        adminStorage = mockStorage;
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Always fallback to mock during build or when credentials are missing
    console.warn('⚠️  Falling back to mock Firebase due to initialization error');
    adminDB = mockFirestore;
    adminAuth = mockAuth;
    adminStorage = mockStorage;
  }
} else {
  // Firebase already initialized
  if (isFirebaseInitialized) {
    adminDB = admin.firestore();
    adminAuth = admin.auth();
    adminStorage = admin.storage();
  } else {
    adminDB = mockFirestore;
    adminAuth = mockAuth;
    adminStorage = mockStorage;
  }
}

export { adminDB, adminAuth, adminStorage };
export default admin;