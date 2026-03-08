import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authenticateUser, findUserByEmail, registerUser } from '../utils/authStorage'
import { signInWithGoogle } from '../services/firebaseAuth'
import { BookOpen } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      console.log('Login attempt:', { email: formData.email, userType: formData.userType })
      
      // Authenticate user using centralized storage
      const result = authenticateUser(formData.email, formData.password, formData.userType)
      
      console.log('Authentication result:', result.success ? 'Success' : 'Failed')
      
      if (!result.success) {
        alert('Invalid email, password, or user type! Please check your credentials or register first.')
        setLoading(false)
        return
      }
      
      console.log('User data:', result.user)
      
      // Login successful - use complete user data
      login(result.user)
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if user has completed profile setup
      const hasCompletedSetup = result.user.selectedState && result.user.selectedMedium && result.user.class
      
      console.log('Profile completed:', hasCompletedSetup)
      
      // Redirect based on profile completion
      if (hasCompletedSetup) {
        console.log('Redirecting to dashboard')
        navigate('/dashboard')
      } else if (formData.userType === 'student' || formData.userType === 'teacher') {
        console.log('Redirecting to state selection')
        navigate('/state-selection')
      } else {
        console.log('Redirecting to dashboard (non-student)')
        navigate('/dashboard')
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    
    // Find user using centralized storage
    const user = findUserByEmail(resetEmail)
    
    if (!user) {
      alert('Email not found! Please check your email or register first.')
      return
    }
    
    // Show password (in real app, send email)
    alert(`Your password is: ${user.password}\n\nPlease save it securely!`)
    setShowForgotPassword(false)
    setResetEmail('')
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    
    try {
      // Attempt Google Sign-In
      const result = await signInWithGoogle()
      
      if (!result.success) {
        alert(result.error)
        setLoading(false)
        return
      }

      const googleUser = result.user
      
      // Check if user already exists in local storage
      let existingUser = findUserByEmail(googleUser.email)
      
      if (!existingUser) {
        // Register new user from Google account
        const registrationResult = registerUser({
          name: googleUser.name,
          email: googleUser.email,
          password: `google_${googleUser.uid}`, // Auto-generated password for Google users
          userType: 'student', // Default to student, can be changed later
          photoURL: googleUser.photoURL,
          provider: 'google',
          uid: googleUser.uid
        })
        
        if (registrationResult.success) {
          existingUser = registrationResult.user
        } else {
          alert('Failed to create user account. Please try again.')
          setLoading(false)
          return
        }
      }
      
      // Login the user
      login(existingUser)
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if user has completed profile setup
      const hasCompletedSetup = existingUser.selectedState && existingUser.selectedMedium && existingUser.class
      
      // Redirect based on profile completion
      if (hasCompletedSetup) {
        navigate('/dashboard')
      } else if (existingUser.userType === 'student' || existingUser.userType === 'teacher') {
        navigate('/state-selection')
      } else {
        navigate('/dashboard')
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Google Sign-In error:', error)
      alert('Google sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-bg">
      <div className="auth-card">
        {/* Animated Icon */}
        <div className="auth-icon-container">
          <BookOpen />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        {/* Google Sign-In Button */}
        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="btn-google"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-label">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="auth-select"
              required
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="auth-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="auth-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? <span className="auth-loading"></span> : 'Sign In'}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm auth-link"
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h3>
            <p className="text-gray-600 mb-4">
              Enter your email address and we'll show you your password.
            </p>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-auth-submit flex-1"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                  }}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login