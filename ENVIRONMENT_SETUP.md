# 🔧 Environment Setup Guide

## ✅ What's Already Configured

Your Firebase configuration is now properly set up:

### Client-Side Configuration
- **Firebase config**: Updated with real values in `src/lib/firebase/config.ts`
- **Environment variables**: Real values in `.env.local` for development

### Admin SDK Configuration  
- **Smart initialization**: Handles multiple credential scenarios
- **Mock mode**: Works without real credentials for development
- **Production ready**: Ready for real service account credentials

## 🔑 Adding Service Account Credentials

To use real Firebase server-side operations, you have two options:

### Option 1: Environment Variables (Recommended for Production)

Open your service account JSON file and extract these values:

```bash
# Add these to your .env.local file:
FIREBASE_PROJECT_ID=trendifymart-dbf91
FIREBASE_CLIENT_EMAIL=your-service-account-email@trendifymart-dbf91.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Actual-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**For Vercel Deployment**:
1. Go to your Vercel project settings
2. Add these same environment variables
3. For `FIREBASE_PRIVATE_KEY`, paste the entire private key with `\n` for line breaks

### Option 2: Service Account File (Local Development)

1. Save your service account JSON file as `firebase-service-account.json` in project root
2. Add to `.env.local`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

**Important**: Add `firebase-service-account.json` to `.gitignore` (already done)

## 🚀 Deployment Scenarios

### Development Mode
- **Current status**: ✅ Ready to run
- **Firebase**: Uses mock Firebase or real Firebase based on credentials
- **Command**: `npm run dev` or `bun dev`

### Production Deployment  
- **Vercel**: Add environment variables to Vercel dashboard
- **Other platforms**: Use environment variables or service account file
- **Command**: `npm run build` then `npm start`

## 🔒 Security Best Practices

- ✅ **Never commit** service account files to git
- ✅ **Use environment variables** in production
- ✅ **Rotate keys** periodically 
- ✅ **Limit service account permissions** to what your app needs

## 🧪 Testing Your Setup

### Test Client-Side Connection
```bash
# Start development server
bun dev

# Visit http://localhost:3000
# Try signing up/logging in
```

### Test Admin SDK (Optional)
If you've added real service account credentials:
```bash
# Check server logs for:
# "🔥 Firebase Admin SDK initialized successfully"
```

## Next Steps

1. **Test your app** with the current setup
2. **Add service account credentials** when you need server-side operations
3. **Deploy to Vercel** with environment variables
4. **Set up Firebase Security Rules** for production

Your app is now ready to use real Firebase! 🎉