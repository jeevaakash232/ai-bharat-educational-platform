# Firebase Files Location Guide

## 📍 Firebase Configuration & Authentication Files

### Main Firebase Service File
**Location:** `src/services/firebaseAuth.js`

This is the primary Firebase configuration file that contains:
- Firebase app initialization
- Authentication setup
- Google Sign-In provider configuration
- Sign-in and sign-out functions

```javascript
// File: src/services/firebaseAuth.js
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBrKkpwV4LqGyFMZPuRp-hWlo6n_bLXDnE",
  authDomain: "ai-bharat-769a6.firebaseapp.com",
  projectId: "ai-bharat-769a6",
  storageBucket: "ai-bharat-769a6.firebasestorage.app",
  messagingSenderId: "158011790496",
  appId: "1:158011790496:web:768dcc1a4989a40f7b65c5"
}

// Exports:
// - signInWithGoogle()
// - signOutFromGoogle()
```

---

## 📦 Firebase Package Installation

### Package.json
**Location:** `package.json`

Firebase is installed as a dependency:
```json
{
  "dependencies": {
    "firebase": "^12.10.0"
  }
}
```

---

## 🔗 Files That Use Firebase

### 1. Login Component
**Location:** `src/components/Login.jsx`

Imports and uses Firebase Google Sign-In:
```javascript
import { signInWithGoogle } from '../services/firebaseAuth'
```

**Usage:**
- Google Sign-In button
- Handles authentication flow
- Stores user data in local storage

---

### 2. Register Component
**Location:** `src/components/Register.jsx`

Imports and uses Firebase Google Sign-In:
```javascript
import { signInWithGoogle } from '../services/firebaseAuth'
```

**Usage:**
- Google Sign-Up button
- New user registration with Google
- Profile setup after registration

---

### 3. Auth Context
**Location:** `src/contexts/AuthContext.jsx`

Uses Firebase authentication state:
```javascript
// Manages user authentication state
// Handles login/logout
// Provides user data to entire app
```

---

## 🗂️ Complete Firebase File Structure

```
AI-Bharat/
├── package.json                          # Firebase dependency
├── package-lock.json                     # Firebase version lock
│
├── src/
│   ├── services/
│   │   └── firebaseAuth.js              # ⭐ MAIN FIREBASE FILE
│   │       ├── Firebase configuration
│   │       ├── Authentication setup
│   │       ├── Google Sign-In provider
│   │       ├── signInWithGoogle()
│   │       └── signOutFromGoogle()
│   │
│   ├── components/
│   │   ├── Login.jsx                    # Uses Firebase auth
│   │   └── Register.jsx                 # Uses Firebase auth
│   │
│   └── contexts/
│       └── AuthContext.jsx              # Manages auth state
│
└── node_modules/
    └── firebase/                         # Firebase SDK (auto-installed)
        ├── @firebase/app
        ├── @firebase/auth
        ├── @firebase/analytics
        └── ... (other Firebase modules)
```

---

## 🔑 Firebase Configuration Details

### Current Firebase Project
- **Project ID:** `ai-bharat-769a6`
- **Auth Domain:** `ai-bharat-769a6.firebaseapp.com`
- **Storage Bucket:** `ai-bharat-769a6.firebasestorage.app`

### Authentication Methods Enabled
- ✅ Google Sign-In
- ✅ Email/Password (via local storage fallback)

---

## 📝 How Firebase is Used in the Project

### 1. User Authentication
```javascript
// Login with Google
const user = await signInWithGoogle()
// Returns: { name, email, photoURL, uid }
```

### 2. Sign Out
```javascript
// Sign out from Firebase
await signOutFromGoogle()
```

### 3. Auth State Management
The `AuthContext` wraps the entire app and provides:
- `user` - Current user object
- `login()` - Login function
- `logout()` - Logout function
- `register()` - Registration function

---

## 🛠️ Firebase Setup Instructions

### If You Need to Change Firebase Configuration:

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: `ai-bharat-769a6`

2. **Get Configuration:**
   - Go to Project Settings
   - Scroll to "Your apps" section
   - Copy the Firebase configuration

3. **Update Configuration:**
   - Edit: `src/services/firebaseAuth.js`
   - Replace the `firebaseConfig` object

4. **Enable Authentication Methods:**
   - Go to Authentication > Sign-in method
   - Enable Google Sign-In
   - Add authorized domains

---

## 🔒 Security Notes

### Current Configuration
⚠️ **Warning:** Firebase API keys are currently hardcoded in the source code.

### Recommended Security Improvements:

1. **Use Environment Variables:**
```javascript
// .env file
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. **Update firebaseAuth.js:**
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

3. **Add to .gitignore:**
```
.env
.env.local
```

---

## 🧪 Testing Firebase Authentication

### Test Google Sign-In:
1. Start the application
2. Go to Login or Register page
3. Click "Sign in with Google" button
4. Select Google account
5. Verify successful login

### Test Sign-Out:
1. Click user profile/logout button
2. Verify redirect to login page
3. Verify user data cleared

---

## 📚 Firebase SDK Modules Used

The project uses these Firebase modules:
- `firebase/app` - Core Firebase app
- `firebase/auth` - Authentication
  - GoogleAuthProvider
  - signInWithPopup
  - getAuth

---

## 🔄 Firebase Authentication Flow

```
User clicks "Sign in with Google"
         ↓
signInWithGoogle() called
         ↓
Firebase popup opens
         ↓
User selects Google account
         ↓
Firebase returns user data
         ↓
User data stored in AuthContext
         ↓
User data saved to localStorage
         ↓
User redirected to dashboard
```

---

## 📞 Support & Resources

### Firebase Documentation:
- **Authentication:** https://firebase.google.com/docs/auth
- **Web Setup:** https://firebase.google.com/docs/web/setup
- **Google Sign-In:** https://firebase.google.com/docs/auth/web/google-signin

### Project-Specific Help:
- Check `src/services/firebaseAuth.js` for implementation
- Check `src/components/Login.jsx` for usage example
- Check `src/contexts/AuthContext.jsx` for state management

---

## ✅ Quick Reference

| What | Where |
|------|-------|
| **Firebase Config** | `src/services/firebaseAuth.js` |
| **Google Sign-In** | `src/components/Login.jsx` |
| **Google Sign-Up** | `src/components/Register.jsx` |
| **Auth State** | `src/contexts/AuthContext.jsx` |
| **Firebase Package** | `package.json` |
| **Firebase SDK** | `node_modules/firebase/` |

---

**Last Updated:** March 2026  
**Firebase Version:** 12.10.0  
**Project:** AI-Bharat Educational Platform
