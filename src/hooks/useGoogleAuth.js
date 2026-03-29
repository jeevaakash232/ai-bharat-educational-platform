import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { findUserByEmail, registerUser } from '../utils/authStorage'
import { signInWithGoogle } from '../services/firebaseAuth'

/**
 * Shared Google sign-in logic.
 * For new users, calls onSelectRole(googleUser) to let the UI ask for role,
 * then call completeGoogleSignIn(googleUser, userType) to finish.
 */
export const useGoogleAuth = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const completeGoogleSignIn = async (googleUser, userType, setLoading) => {
    setLoading(true)
    try {
      const reg = registerUser({
        name: googleUser.name,
        email: googleUser.email,
        password: `google_${googleUser.uid}`,
        userType,
        photoURL: googleUser.photoURL,
        provider: 'google',
        uid: googleUser.uid,
      })
      if (!reg.success) { alert('Failed to create account.'); return }
      const newUser = reg.user
      login(newUser)
      await new Promise(r => setTimeout(r, 100))
      if (['student', 'teacher'].includes(userType)) navigate('/state-selection')
      else navigate('/dashboard')
    } catch {
      alert('Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async (setLoading, onSelectRole) => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (!result.success) { alert(result.error); return }

      const googleUser = result.user
      const existingUser = findUserByEmail(googleUser.email)

      if (existingUser) {
        // Returning user — log straight in
        login(existingUser)
        await new Promise(r => setTimeout(r, 100))
        const done = existingUser.selectedState && existingUser.selectedMedium && existingUser.class
        if (done) navigate('/dashboard')
        else if (['student', 'teacher'].includes(existingUser.userType)) navigate('/state-selection')
        else navigate('/dashboard')
      } else {
        // New user — ask for role
        setLoading(false)
        onSelectRole(googleUser)
      }
    } catch {
      alert('Google sign-in failed.')
      setLoading(false)
    }
  }

  return { handleGoogleSignIn, completeGoogleSignIn }
}
