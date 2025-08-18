import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCZGldvOVLdomTmFZhAqLWw9kxWjlVli3M",
  authDomain: "trendifymart-dbf91.firebaseapp.com",
  projectId: "trendifymart-dbf91",
  storageBucket: "trendifymart-dbf91.firebasestorage.app",
  messagingSenderId: "832190031840",
  appId: "1:832190031840:web:cc9b61c5e75f098cb6ad85",
  measurementId: "G-VEXN7V4FG8"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics (only on client side)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;