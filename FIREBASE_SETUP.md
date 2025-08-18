# Firebase Setup Guide

This guide will help you set up Firebase for the Trendify Mart e-commerce platform.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `trendifymart` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

## 2. Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Optionally enable other providers (Google, Facebook, etc.)

### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll deploy security rules)
4. Select a location close to your users
5. Click "Done"

### Storage
1. Go to **Storage**
2. Click "Get started"
3. Review security rules (we'll customize these)
4. Select the same location as Firestore
5. Click "Done"

### Analytics (Optional)
1. Go to **Analytics**
2. Enable Google Analytics if not already enabled
3. Link to your Google Analytics account

## 3. Get Configuration Values

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register your app with name: `Trendify Mart`
5. Copy the configuration object

Your config should look like this:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 4. Configure Environment Variables

Update your `.env` file with the configuration values:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Set Up Firebase Admin SDK (For Production)

For server-side operations, you need Firebase Admin SDK:

1. In Firebase Console, go to **Project Settings**
2. Click **Service Accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Store it securely (never commit to git!)

### Option A: Using Service Account File
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Option B: Using Environment Variables
Extract values from the service account JSON:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## 6. Deploy Firestore Security Rules

Install Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Firebase in your project (optional):
```bash
firebase init
```

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

## 7. Firestore Security Rules

The project includes comprehensive security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             resource.data.role == 'admin';
    }
    
    // Public read access to products and categories
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if isAuthenticated() && 
                           (request.auth.uid == userId || isAdmin());
    }
    
    // Cart items are session or user based
    match /cartItems/{cartItemId} {
      allow read, write: if isAuthenticated();
    }
    
    // Orders - customers can read their own, admins can read all
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                    (resource.data.customerEmail == request.auth.token.email || 
                     isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
      
      // Order items subcollection
      match /orderItems/{orderItemId} {
        allow read: if isAuthenticated() && 
                      (get(/databases/$(database)/documents/orders/$(orderId)).data.customerEmail == request.auth.token.email || 
                       isAdmin());
        allow write: if isAdmin();
      }
    }
    
    // Analytics - admin only
    match /analytics/{analyticsId} {
      allow read, write: if isAdmin();
    }
  }
}
```

## 8. Storage Security Rules

Configure Firebase Storage rules for image uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
    
    match /temp/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 9. Seed Database (Optional)

Populate your database with sample data:

```bash
# Using npm
npm run seed

# Using bun directly
bun run src/lib/firebase/seeds/index.ts
```

This will create:
- Sample categories
- Sample products
- Test users (including admin@gmail.com)
- Sample orders

## 10. Production Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   vercel
   ```

2. **Set Environment Variables:**
   In Vercel dashboard, add all environment variables from `.env`

3. **Firebase Admin Setup:**
   - Upload service account JSON as a file, OR
   - Set individual environment variables for project ID, client email, and private key

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Custom Domain (Optional)

1. In Firebase Console, go to **Hosting**
2. Add custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

## 11. Monitoring and Analytics

### Firebase Analytics
- View user behavior in Firebase Console > Analytics
- Set up custom events for e-commerce tracking
- Monitor conversion funnels

### Performance Monitoring
1. Go to **Performance** in Firebase Console
2. Enable performance monitoring
3. View app performance metrics

### Crashlytics (Optional)
1. Enable Crashlytics for error reporting
2. Monitor app stability and crashes
3. Get detailed error reports

## 12. Backup and Security

### Database Backups
1. Set up automated Firestore backups
2. Configure backup schedules
3. Test restore procedures

### Security Best Practices
- Never commit service account keys to version control
- Use environment variables for all sensitive data
- Regularly review and update security rules
- Enable audit logs for admin actions
- Set up monitoring alerts for unusual activity

## Troubleshooting

### Common Issues

1. **"Permission denied" errors:**
   - Check Firestore security rules
   - Verify user authentication status
   - Ensure user has correct role/permissions

2. **"Firebase app not initialized":**
   - Check environment variables
   - Verify Firebase configuration
   - Ensure all required variables are set

3. **"Service account not found":**
   - Verify GOOGLE_APPLICATION_CREDENTIALS path
   - Check service account JSON file permissions
   - Ensure service account has correct roles

4. **CORS errors:**
   - Add your domain to Firebase Auth authorized domains
   - Check Firebase project configuration

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- Project Issues: Create an issue in the repository

## Next Steps

After completing this setup:
1. Test all authentication flows
2. Verify database operations
3. Upload sample product images
4. Test the complete user journey
5. Set up monitoring and analytics
6. Plan your launch strategy!

Happy coding! 🚀