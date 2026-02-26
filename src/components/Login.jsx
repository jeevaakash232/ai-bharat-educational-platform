import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authenticateUser, findUserByEmail } from '../utils/authStorage'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your EduLearn account</p>
            <p className="text-xs text-gray-500 mt-2">
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register first</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User Type</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h3>
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll show you your password.
              </p>
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmail('')
                    }}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login