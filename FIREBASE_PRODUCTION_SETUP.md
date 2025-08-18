# 🔥 Firebase Production Setup Guide for Trendify Mart

This guide will walk you through setting up a **real Firebase project** for production deployment of your Trendify Mart e-commerce application.

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] Google account (Gmail)
- [ ] Access to Firebase Console
- [ ] Project deployed/ready to deploy
- [ ] Admin access to your development environment

---

## 🚀 Step 1: Create Firebase Project

### 1.1 Access Firebase Console

1. **Go to Firebase Console**
   - Open [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Create a project"** or **"Add project"**
   - If you have existing projects, click **"Add project"** in the project selector

### 1.2 Project Configuration

1. **Project Name**
   - Enter: `Trendify Mart` (or your preferred name)
   - Project ID will be auto-generated (e.g., `trendify-mart-abc123`)
   - **Note:** Project ID cannot be changed later, so choose carefully
   - Click **"Continue"**

2. **Google Analytics**
   - **Enable Google Analytics**: ✅ **Recommended**
   - This provides valuable insights about your users
   - Click **"Continue"**

3. **Analytics Account**
   - Choose existing Google Analytics account or create new one
   - Select your country/region
   - Accept terms and click **"Create project"**

4. **Wait for Creation**
   - Firebase will set up your project (takes 30-60 seconds)
   - Click **"Continue"** when ready

---

## 🔧 Step 2: Enable Firebase Services

### 2.1 Enable Authentication

1. **Navigate to Authentication**
   - In the Firebase Console sidebar, click **"Authentication"**
   - Click **"Get started"**

2. **Set up Sign-in Methods**
   - Go to **"Sign-in method"** tab
   - Click on **"Email/Password"**
   - **Enable** both options:
     - ✅ Email/Password
     - ✅ Email link (passwordless sign-in) - *Optional*
   - Click **"Save"**

3. **Optional: Additional Providers**
   - You can also enable:
     - Google Sign-in (recommended for better UX)
     - Facebook, Twitter, etc.

### 2.2 Enable Firestore Database

1. **Navigate to Firestore**
   - Click **"Firestore Database"** in sidebar
   - Click **"Create database"**

2. **Security Rules**
   - Choose **"Start in production mode"**
   - We'll deploy custom rules later
   - Click **"Next"**

3. **Database Location**
   - Choose location closest to your users:
     - **US**: `us-central1` (Iowa)
     - **Europe**: `europe-west1` (Belgium)  
     - **Asia**: `asia-south1` (Mumbai)
   - **Important:** Cannot be changed later
   - Click **"Done"**

4. **Wait for Database Creation**
   - Firestore will initialize (takes 1-2 minutes)

### 2.3 Enable Storage

1. **Navigate to Storage**
   - Click **"Storage"** in sidebar
   - Click **"Get started"**

2. **Security Rules**
   - Start in **production mode** (secure by default)
   - Click **"Next"**

3. **Storage Location**
   - Use same location as Firestore for consistency
   - Click **"Done"**

### 2.4 Enable Analytics (Already Done)
   - Analytics was enabled during project creation
   - You can view analytics later in the **"Analytics"** section

---

## 🔑 Step 3: Get Firebase Configuration

### 3.1 Add Web App

1. **Project Overview**
   - Go back to **"Project Overview"** (home icon)
   - Click the **Web icon** `</>` to add a web app

2. **App Configuration**
   - **App nickname**: `Trendify Mart Web`
   - ✅ **Also set up Firebase Hosting** (optional, but recommended)
   - Click **"Register app"**

3. **Firebase SDK Configuration**
   - Copy the configuration object that appears:

```javascript
// Your Firebase configuration (example)
const firebaseConfig = {
  apiKey: "AIzaSyExample-Key-Here",
  authDomain: "trendify-mart-abc123.firebaseapp.com",
  projectId: "trendify-mart-abc123",
  storageBucket: "trendify-mart-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCD123456"
};
```

4. **Save Configuration**
   - **Copy this entire configuration**
   - Save it temporarily in a text file
   - Click **"Continue to console"**

### 3.2 Update Your Environment Variables

Now we need to update your local environment with the real Firebase configuration:

1. **Update .env.local**
   - Open your project's `.env.local` file
   - Replace the mock values with your real Firebase config:

```bash
# Firebase Configuration (Replace with YOUR values)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyExample-Key-Here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trendify-mart-abc123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=trendify-mart-abc123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=trendify-mart-abc123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCD123456

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛡️ Step 4: Set up Firebase Admin SDK

### 4.1 Generate Service Account Key

1. **Project Settings**
   - In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
   - Select **"Project settings"**

2. **Service Accounts**
   - Go to **"Service accounts"** tab
   - Scroll down to **"Firebase Admin SDK"** section
   - Select **"Node.js"** as the configuration snippet
   - Click **"Generate new private key"**

3. **Download Service Account**
   - A dialog will appear with a security warning
   - Click **"Generate key"**
   - A JSON file will download (e.g., `trendify-mart-abc123-firebase-adminsdk-xyz.json`)
   - **⚠️ Keep this file secure - it contains sensitive credentials**

### 4.2 Set up Service Account Credentials

**Option A: Environment Variables (Recommended for Vercel)**

1. **Extract Key Information**
   - Open the downloaded JSON file
   - Extract these values:
     - `project_id`
     - `client_email`
     - `private_key`

2. **Update .env.local**
   - Add these lines to your `.env.local` file:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=trendify-mart-abc123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@trendify-mart-abc123.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...your-private-key-here...\n-----END PRIVATE KEY-----\n"
```

**Option B: Service Account File (Local Development)**

1. **Save Service Account File**
   - Create a `service-account` folder in your project root
   - Move the JSON file there
   - Rename it to `serviceAccountKey.json`

2. **Update .env.local**
   - Add this line:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account/serviceAccountKey.json
```

3. **Update .gitignore**
   - Add to `.gitignore`:
```
service-account/
*.json
```

---

## 🔄 Step 5: Update Codebase for Real Firebase

### 5.1 Remove Mock Firebase

1. **Update Firebase Admin Configuration**
   - Open `src/lib/firebase/admin.ts`
   - Replace the current content with:

```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
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
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account file (local development)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
      });
    } else {
      throw new Error('Firebase Admin credentials not configured');
    }
    
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
}

export const adminDB = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

export default admin;
```

### 5.2 Update Client Firebase Configuration

1. **Update Firebase Config**
   - Open `src/lib/firebase/config.ts`
   - Replace hardcoded values with environment variables:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

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
```

---

## 🔒 Step 6: Deploy Firestore Security Rules

### 6.1 Install Firebase CLI

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```
   - This will open your browser for authentication
   - Sign in with the same Google account you used for Firebase Console

### 6.2 Initialize Firebase in Your Project

1. **Navigate to Your Project**
   ```bash
   cd /path/to/your/trendify-mart-project
   ```

2. **Initialize Firebase**
   ```bash
   firebase init
   ```

3. **Select Features**
   - Use arrow keys and spacebar to select:
     - ✅ **Firestore: Configure security rules and indexes**
     - ✅ **Storage: Configure security rules**
     - ✅ **Hosting: Configure files for Firebase Hosting** (optional)

4. **Project Setup**
   - **Use an existing project**: Select your newly created Firebase project
   - **Firestore Rules**: Accept default `firestore.rules`
   - **Firestore Indexes**: Accept default `firestore.indexes.json`
   - **Storage Rules**: Accept default `storage.rules`

### 6.3 Deploy Security Rules

1. **Verify Rules File**
   - Check that `firestore.rules` exists in your project root
   - It should contain the security rules (already provided in your project)

2. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Storage Rules (Optional)**
   ```bash
   firebase deploy --only storage:rules
   ```

4. **Verify Deployment**
   - Check Firebase Console > Firestore Database > Rules
   - You should see your custom rules applied

---

## ✅ Step 7: Test Firebase Connection

### 7.1 Restart Development Server

1. **Stop Current Server**
   ```bash
   # In your project directory
   # Stop any running dev server (Ctrl+C)
   ```

2. **Start Server with New Configuration**
   ```bash
   bun run dev
   ```

3. **Check Logs**
   - Look for: "🔥 Firebase Admin SDK initialized successfully"
   - If you see errors, check your environment variables

### 7.2 Test API Endpoints

1. **Test Products API**
   ```bash
   curl http://localhost:3000/api/products
   ```
   - Should return empty array `[]` (no data yet)
   - No mock data should appear

2. **Test Categories API**
   ```bash
   curl http://localhost:3000/api/categories
   ```
   - Should return empty array `[]`

3. **Test Authentication**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```
   - Should create a real user in Firebase Auth

---

## 📊 Step 8: Seed Database with Initial Data

### 8.1 Create Seed Script

Your project already includes seed functions. Let's create a simple script to populate your database:

1. **Create Seed Runner**
   - Create `scripts/seed.ts`:

```typescript
import { seedCategories } from '../src/lib/firebase/seeds/categories';
import { seedProducts } from '../src/lib/firebase/seeds/products';
import { seedUsers } from '../src/lib/firebase/seeds/users';

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed in order (categories first, then products)
    await seedCategories();
    console.log('✅ Categories seeded');
    
    await seedProducts();
    console.log('✅ Products seeded');
    
    await seedUsers();
    console.log('✅ Users seeded');
    
    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

runSeeds();
```

### 8.2 Run Seed Script

1. **Execute Seeding**
   ```bash
   bun run scripts/seed.ts
   ```

2. **Verify in Firebase Console**
   - Go to Firestore Database
   - You should see collections: `categories`, `products`, `users`
   - Each should contain sample data

---

## 🎯 Step 9: Verification Checklist

### ✅ Firebase Console Verification

- [ ] Project created and visible in Firebase Console
- [ ] Authentication enabled with Email/Password
- [ ] Firestore Database created and accessible
- [ ] Storage enabled
- [ ] Web app registered
- [ ] Security rules deployed

### ✅ Local Development Verification

- [ ] Environment variables updated with real Firebase config
- [ ] Development server starts without errors
- [ ] API endpoints return real data (or empty arrays)
- [ ] Can create users through registration API
- [ ] Database seeding works

### ✅ Data Verification

- [ ] Firestore contains seeded categories
- [ ] Firestore contains seeded products
- [ ] Firestore contains seeded users
- [ ] Authentication creates users in Firebase Auth

---

## 🚀 Next Steps

### For Production Deployment

1. **Set up Production Environment Variables**
   - Copy all environment variables to your deployment platform
   - For Vercel: Add in Project Settings > Environment Variables

2. **Deploy Security Rules to Production**
   - Ensure rules are deployed before going live

3. **Set up Monitoring**
   - Enable Firebase Analytics
   - Set up error monitoring
   - Configure performance monitoring

4. **Domain Configuration**
   - Add your production domain to Firebase Auth authorized domains
   - Configure Firebase Hosting (optional)

### Security Best Practices

1. **Service Account Security**
   - Never commit service account keys to Git
   - Rotate keys periodically
   - Use environment variables in production

2. **Firestore Rules**
   - Review and test security rules
   - Use Firebase Emulator for rule testing
   - Monitor security rule hits in production

3. **Authentication**
   - Enable multi-factor authentication for admin users
   - Set up password policies
   - Monitor authentication logs

---

## 🆘 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Verify user authentication
   - Ensure proper collection names

2. **"Firebase app not initialized" errors**
   - Verify all environment variables are set
   - Check Firebase configuration object
   - Restart development server

3. **Authentication failures**
   - Check if Email/Password is enabled in Firebase Auth
   - Verify API key is correct
   - Check for typos in configuration

4. **Service account errors**
   - Verify service account key is valid
   - Check private key formatting (newlines)
   - Ensure proper permissions

### Getting Help

- Firebase Documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Firebase Support: Available in Firebase Console
- Community: Stack Overflow with `firebase` tag

---

**🎉 Congratulations!** Your Firebase project is now set up for production use!

Your Trendify Mart application now has:
- ✅ Real user authentication
- ✅ Production-ready database
- ✅ Secure file storage
- ✅ Analytics and monitoring
- ✅ Scalable backend infrastructure

Ready to deploy to production! 🚀