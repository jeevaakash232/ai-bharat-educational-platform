import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { registerUser, findUserByEmail } from '../utils/authStorage'
import { signInWithGoogle } from '../services/firebaseAuth'
import { BookOpen } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  })
  const [loading, setLoading] = useState(false)
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
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }
    
    setLoading(true)
    
    try {
      // Register user using centralized storage
      const result = registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      })
      
      if (!result.success) {
        alert('User with this email already exists! Please login instead.')
        setLoading(false)
        return
      }
      
      // Auto-login after registration
      login(result.user)
      
      // Redirect based on user type
      if (formData.userType === 'student' || formData.userType === 'teacher') {
        navigate('/state-selection')
      } else {
        navigate('/dashboard')
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
      setLoading(false)
    }
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Join EduLearn</h2>
          <p className="text-gray-600">Create your account and start learning</p>
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
          <span>or sign up with email</span>
        </div>

        {/* Registration Form */}
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
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="auth-input"
              required
            />
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
              placeholder="Create a password (min 6 characters)"
              className="auth-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="auth-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? <span className="auth-loading"></span> : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register