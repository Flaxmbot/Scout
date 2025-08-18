// Mock Firebase Admin for testing
// This allows testing the application without real Firebase credentials

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
        },
        {
          id: 'mock-id-2', 
          data: () => ({
            id: 'mock-id-2',
            name: 'Mock Product 2',
            price: 799,
            category: 'Mock Category',
            createdAt: new Date().toISOString()
          })
        }
      ],
      size: 2,
      empty: false
    }),
    where: (field: string, op: string, value: any) => mockFirestore.collection(name),
    orderBy: (field: string, direction?: string) => mockFirestore.collection(name),
    limit: (count: number) => mockFirestore.collection(name),
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
  }),
  createUser: async (data: any) => ({
    uid: 'new-mock-user-id',
    email: data.email
  }),
  getUserByEmail: async (email: string) => ({
    uid: 'mock-user-id',
    email: email
  })
};

const mockStorage = {
  bucket: () => ({
    upload: async () => ({ name: 'mock-file.jpg' }),
    file: (name: string) => ({
      delete: async () => true,
      getSignedUrl: async () => ['https://mock-url.com/file.jpg']
    })
  })
};

export const adminDB = mockFirestore;
export const adminAuth = mockAuth;
export const adminStorage = mockStorage;

export default {
  apps: [{ name: 'mock-app' }],
  firestore: () => mockFirestore,
  auth: () => mockAuth,
  storage: () => mockStorage
};