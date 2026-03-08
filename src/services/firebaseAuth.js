import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

// Firebase configuration
// TODO: Replace with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyBrKkpwV4LqGyFMZPuRp-hWlo6n_bLXDnE",
  authDomain: "ai-bharat-769a6.firebaseapp.com",
  projectId: "ai-bharat-769a6",
  storageBucket: "ai-bharat-769a6.firebasestorage.app",
  messagingSenderId: "158011790496",
  appId: "1:158011790496:web:768dcc1a4989a40f7b65c5",
  measurementId: "G-EZD8YJHJZM"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

/**
 * Sign in with Google using Firebase popup
 * @returns {Promise<Object>} User data object with name, email, photoURL, uid
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Extract user information
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      provider: 'google'
    }

    return {
      success: true,
      user: userData
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error)
    
    // Handle specific error cases
    let errorMessage = 'Google sign-in failed. Please try again.'
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled. Please try again.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Pop-up blocked by browser. Please allow pop-ups and try again.'
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection and try again.'
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Sign out from Firebase
 */
export const signOutFromGoogle = async () => {
  try {
    await auth.signOut()
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

export { auth, googleProvider }
