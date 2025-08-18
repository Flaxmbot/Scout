import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config';
import { adminAuth, adminDB } from '../admin';
import { User, COLLECTIONS } from '../types';

export class AuthService {
  // Client-side authentication methods
  static async register(email: string, password: string, name: string, role: string = 'user'): Promise<{ user: User; firebaseUser: FirebaseUser }> {
    try {
      // Create user with Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(credential.user, {
        displayName: name
      });

      // Create user document in Firestore
      const userData: User = {
        id: credential.user.uid,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), userData);

      return {
        user: userData,
        firebaseUser: credential.user
      };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async login(email: string, password: string): Promise<{ user: User; firebaseUser: FirebaseUser }> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, credential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      return {
        user: userDoc.data() as User,
        firebaseUser: credential.user
      };
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  }

  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
    } catch (error: any) {
      // Don't throw error for security reasons - always return success
      console.error('Password reset error:', error);
    }
  }

  static async resetPassword(oobCode: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Server-side authentication methods (using Firebase Admin)
  static async verifyIdToken(idToken: string): Promise<{ user: User; decodedToken: any }> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      // Get user data from Firestore
      const userDoc = await adminDB.collection(COLLECTIONS.USERS).doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      return {
        user: userDoc.data() as User,
        decodedToken
      };
    } catch (error: any) {
      throw new Error('Invalid or expired token');
    }
  }

  static async getUserById(uid: string): Promise<User | null> {
    try {
      const userDoc = await adminDB.collection(COLLECTIONS.USERS).doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = adminDB.collection(COLLECTIONS.USERS).doc(uid);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await userRef.update(updateData);
      
      const updatedDoc = await userRef.get();
      
      if (!updatedDoc.exists) {
        throw new Error('User not found');
      }

      return updatedDoc.data() as User;
    } catch (error: any) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  static async createServerUser(uid: string, userData: Omit<User, 'id'>): Promise<User> {
    try {
      const userDoc: User = {
        id: uid,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await adminDB.collection(COLLECTIONS.USERS).doc(uid).set(userDoc);
      
      return userDoc;
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  // Utility methods
  static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid credentials';
      case 'auth/email-already-in-use':
        return 'Email already exists';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later';
      case 'auth/expired-action-code':
      case 'auth/invalid-action-code':
        return 'Reset token has expired or is invalid';
      case 'auth/missing-email':
        return 'Email is required';
      case 'auth/missing-password':
        return 'Password is required';
      default:
        return 'Authentication failed. Please try again';
    }
  }

  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7).trim();
  }
}