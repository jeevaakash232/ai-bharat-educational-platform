import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { findUserByEmail, registerUser } from '../utils/authStorage'
import { signInWithGoogle } from '../services/firebaseAuth'

/**
 * Shared Google sign-in logic used by both Login and Register.
 */
export const useGoogleAuth = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSignIn = async (setLoading) => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (!result.success) {
        alert(result.error)
        setLoading(false)
        return
      }

      const googleUser = result.user
      let existingUser = findUserByEmail(googleUser.email)

      if (!existingUser) {
        const reg = registerUser({
          name: googleUser.name,
          email: googleUser.email,
          password: `google_${googleUser.uid}`,
          userType: 'student',
          photoURL: googleUser.photoURL,
          provider: 'google',
          uid: googleUser.uid,
        })
        if (!reg.success) {
          alert('Failed to create account.')
          setLoading(false)
          return
        }
        existingUser = reg.user
      }

      login(existingUser)
      await new Promise(r => setTimeout(r, 100))

      const done = existingUser.selectedState && existingUser.selectedMedium && existingUser.class
      if (done) navigate('/dashboard')
      else if (['student', 'teacher'].includes(existingUser.userType)) navigate('/state-selection')
      else navigate('/dashboard')
    } catch {
      alert('Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return { handleGoogleSignIn }
}
