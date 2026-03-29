import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authenticateUser } from '../utils/authStorage'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { BookOpen, GraduationCap, Users, Star } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', userType: 'student' })
  const [loading, setLoading] = useState(false)
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('student')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { handleGoogleSignIn, completeGoogleSignIn } = useGoogleAuth()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = authenticateUser(formData.email, formData.password, formData.userType)
      if (!result.success) {
        alert('Invalid email, password, or user type!')
        setLoading(false)
        return
      }
      login(result.user)
      await new Promise(r => setTimeout(r, 100))
      const done = result.user.selectedState && result.user.selectedMedium && result.user.class
      if (done) navigate('/dashboard')
      else if (['student', 'teacher'].includes(formData.userType)) navigate('/state-selection')
      else navigate('/dashboard')
      setLoading(false)
    } catch {
      alert('Login failed. Please try again.')
      setLoading(false)
    }
  }



  return (
    <div className="edu-auth-page">
      <div className="edu-auth-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', backdropFilter: 'blur(10px)' }}>
            <BookOpen size={32} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>EduLearn</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
            Empowering Young Minds<br />From Grade One To Twelve
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: GraduationCap, text: 'AI-powered personalized learning' },
              { icon: Users, text: 'Live classes with expert teachers' },
              { icon: Star, text: 'Track progress with smart analytics' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', backdropFilter: 'blur(8px)' }}>
                <Icon size={18} color="white" />
                <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="edu-auth-right">
        <div className="edu-auth-form-wrap">
          <h1 className="edu-auth-title">Welcome Back!</h1>
          <p className="edu-auth-subtitle">Sign in to continue your learning journey</p>

          <button type="button" onClick={() => handleGoogleSignIn(setLoading, setPendingGoogleUser)} className="edu-btn-google" disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="edu-divider">or sign in with email</div>

          <form onSubmit={handleSubmit}>
            <div className="edu-form-group">
              <label className="edu-label">User Type</label>
              <select name="userType" value={formData.userType} onChange={handleChange} className="edu-select" required>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div className="edu-form-group">
              <label className="edu-label">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="edu-input" required />
            </div>
            <div className="edu-form-group">
              <label className="edu-label">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="edu-input" required />
            </div>
            <button type="submit" className="edu-btn-submit" disabled={loading}>
              {loading ? <span className="edu-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" className="edu-link">Sign up here</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#9ca3af' }}>
            Forgot password? Contact support for assistance.
          </p>
        </div>
      </div>

      {/* Google Role Selection Modal */}
      {pendingGoogleUser && (
        <div className="edu-modal-overlay">
          <div className="edu-modal">
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Welcome, {pendingGoogleUser.name?.split(' ')[0]}!</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>How will you be using EduLearn?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { value: 'student', label: 'Student', desc: 'I want to learn and take quizzes' },
                { value: 'teacher', label: 'Teacher', desc: 'I want to teach and upload content' },
                { value: 'parent', label: 'Parent', desc: 'I want to monitor my child\'s progress' },
              ].map(({ value, label, desc }) => (
                <button key={value} onClick={() => setSelectedRole(value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, border: `2px solid ${selectedRole === value ? '#4f46e5' : '#e5e7eb'}`, background: selectedRole === value ? '#eef2ff' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: selectedRole === value ? 'var(--edu-gradient)' : '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16 }}>{value === 'student' ? '🎓' : value === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: selectedRole === value ? '#4f46e5' : '#1a1a2e' }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => completeGoogleSignIn(pendingGoogleUser, selectedRole, setLoading)} className="edu-btn-submit" style={{ flex: 1 }}>
                Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </button>
              <button onClick={() => setPendingGoogleUser(null)} style={{ flex: 0, padding: '13px 16px', borderRadius: 12, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#6b7280' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
