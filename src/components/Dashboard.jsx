import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Brain, Award, LogOut, User, Book, Settings as SettingsIcon, Trash2, Video, Clock, TrendingUp, Sparkles, Briefcase, Heart, Target } from 'lucide-react'
import { initializeStudentData } from '../utils/autoDataPopulator'

const Dashboard = () => {
  const { user, logout, predictions, predictionsLoading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleClearCache = async () => {
    if (confirm('Clear all cache data? This will refresh the app with the latest version.')) {
      try {
        // Clear localStorage (except user data)
        const userData = localStorage.getItem('edulearn_user')
        const registeredUsers = localStorage.getItem('registeredUsers')
        
        localStorage.clear()
        
        // Restore user data
        if (userData) localStorage.setItem('edulearn_user', userData)
        if (registeredUsers) localStorage.setItem('registeredUsers', registeredUsers)
        
        // Clear caches
        if ('caches' in window) {
          const names = await caches.keys()
          await Promise.all(names.map(n => caches.delete(n)))
        }
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map(r => r.unregister()))
        }
        
        alert('Cache cleared! Reloading...')
        window.location.reload(true)
      } catch (error) {
        console.error('Clear cache error:', error)
        alert('Cache cleared! Reloading...')
        window.location.reload(true)
      }
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      console.log('Dashboard - Current user:', user)
      console.log('Dashboard - User name:', user.name)
      
      // Auto-generate student data if user is a student and has no data
      if (user.userType === 'student') {
        initializeStudentData(user)
      }
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] perspective-container">
      {/* 3D Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          {/* Mobile Header - Only show on small screens */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <h1 className="text-lg font-bold text-gray-800">EduLearn</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearCache}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  aria-label="Clear Cache"
                  title="Clear Cache"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <Link
                  to="/settings"
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  aria-label="Settings"
                  title="Settings"
                >
                  <SettingsIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/history"
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  aria-label="History"
                  title="Learning History"
                >
                  <Clock className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-600">
                Welcome, {user.name || user.email?.split('@')[0] || 'User'}!
              </p>
              <div className="flex items-center space-x-1 text-gray-600">
                <User className="h-3 w-3" />
                <span className="capitalize">{user.userType}</span>
              </div>
            </div>
          </div>

          {/* Desktop Header - Only show on medium+ screens */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EduLearn</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="capitalize">{user.userType}</span>
              </div>
              <button
                onClick={handleClearCache}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Clear Cache"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Cache</span>
              </button>
              <Link
                to="/settings"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <Link
                to="/history"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Clock className="h-4 w-4" />
                <span>History</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Profile Info */}
        {user.userType === 'student' && user.profileComplete && (
          <div className="card mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {user.selectedState && (
                <div>
                  <span className="font-medium text-gray-600">State:</span> {user.selectedState}
                </div>
              )}
              {user.mediumName && (
                <div>
                  <span className="font-medium text-gray-600">Medium:</span> {user.mediumName}
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Board:</span> {user.board}
              </div>
              <div>
                <span className="font-medium text-gray-600">Class:</span> {user.class}
              </div>
              {user.department && (
                <div>
                  <span className="font-medium text-gray-600">Department:</span> {user.department}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Link to="/student-dashboard" className="card glass-panel glow-effect bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <TrendingUp className="h-12 w-12 text-indigo-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">📈 My Performance</h3>
              <p className="text-gray-600 text-sm">🤖 AI-powered insights and predictions</p>
              {predictions && predictions.prediction && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-600 flex items-center justify-center gap-2">
                    <span>🎯</span>
                    <span>{predictions.prediction.predicted_score}%</span>
                  </div>
                  <div className="text-xs text-gray-600 capitalize mt-1">
                    ✨ {predictions.prediction.confidence} confidence
                  </div>
                </div>
              )}
              {predictionsLoading && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <div className="text-xs text-gray-600">Loading predictions...</div>
                </div>
              )}
            </div>
          </Link>

          <Link to="/ai-assistant" className="card glass-panel glow-effect">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Brain className="h-12 w-12 text-indigo-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">🤖 AI Assistant</h3>
              <p className="text-gray-600 text-sm">💡 Get help with doubts, explanations, and more</p>
            </div>
          </Link>

          <Link to="/enhanced-ai-assistant" className="card glass-panel glow-effect bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Brain className="h-12 w-12 text-purple-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">🎭 Enhanced AI</h3>
              <p className="text-gray-600 text-sm">😊 Emotion-aware • 📱 Offline-ready</p>
              <div className="mt-2 flex justify-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Voice Analysis</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Offline Mode</span>
              </div>
            </div>
          </Link>

          <Link to="/guide-books" className="card glass-panel glow-effect">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Book className="h-12 w-12 text-green-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">📖 Guide Books</h3>
              <p className="text-gray-600 text-sm">📝 Access comprehensive study materials</p>
            </div>
          </Link>

          <Link to="/live-classes" className="card glass-panel glow-effect">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Video className="h-12 w-12 text-indigo-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">🎥</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">📹 Recorded Classes</h3>
              <p className="text-gray-600 text-sm">🎬 Watch educational video recordings</p>
            </div>
          </Link>

          <Link to="/teacher-assistant" className="card glass-panel glow-effect bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Sparkles className="h-12 w-12 text-purple-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">🎓 Teacher Assistant</h3>
              <p className="text-gray-600 text-sm">✨ AI-powered content generation for teachers</p>
            </div>
          </Link>

          <Link to="/career-simulator" className="card glass-panel glow-effect bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Briefcase className="h-12 w-12 text-blue-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">💼</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">🎯 Career Simulator</h3>
              <p className="text-gray-600 text-sm">🚀 Explore life after school</p>
              <div className="mt-2 flex justify-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📅 Daily Life</span>
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">💰 Salary</span>
              </div>
            </div>
          </Link>

          <Link to="/auto-health-tracker" className="card glass-panel glow-effect bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Heart className="h-12 w-12 text-pink-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">❤️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">💪 Auto Health Tracker</h3>
              <p className="text-gray-600 text-sm">🏃 Automatic wellness monitoring</p>
              <div className="mt-2 flex justify-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">🤖 Auto</span>
                <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">⚡ Real-time</span>
              </div>
            </div>
          </Link>

          <Link to="/discipline" className="card glass-panel glow-effect bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Target className="h-12 w-12 text-orange-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">🔥</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">🎯 Discipline Learning</h3>
              <p className="text-gray-600 text-sm">💎 Build better habits</p>
              <div className="mt-2 flex justify-center gap-2">
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">🔥 Streaks</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">🏆 Rewards</span>
              </div>
            </div>
          </Link>

          <Link to="/visualizations" className="card glass-panel glow-effect">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="h-12 w-12 text-purple-600 mx-auto flex items-center justify-center relative">
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="absolute -top-2 -right-2 text-2xl">🔬</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">🧪 Visualizations</h3>
              <p className="text-gray-600 text-sm">🎨 Interactive animations and visual learning</p>
            </div>
          </Link>

          <Link to="/quiz/general" className="card glass-panel glow-effect">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Award className="h-12 w-12 text-yellow-600 mx-auto" />
                <span className="absolute -top-1 -right-1 text-2xl">🏅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">📝 Quizzes</h3>
              <p className="text-gray-600 text-sm">🎯 Test your knowledge with interactive quizzes</p>
            </div>
          </Link>
        </div>

        {/* Subjects */}
        {user.userType === 'student' && user.subjects && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Your Subjects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {user.subjects.map((subject) => (
                <Link
                  key={subject}
                  to={`/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`}
                  className="card glass-panel glow-effect"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-lg">
                        {subject.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{subject}</h3>
                    <div className="flex justify-between text-sm text-gray-600 mt-4">
                      <span>Chapters: 12</span>
                      <span>Progress: 45%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Non-student dashboard */}
        {user.userType !== 'student' && (
          <div>
            {/* Teacher Quick Actions */}
            {user.userType === 'teacher' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <Link to="/admin" className="card glass-panel glow-effect">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
                    <p className="text-gray-600 text-sm">Manage books and monitor platform</p>
                  </div>
                </Link>

                <Link to="/upload-books" className="card glass-panel glow-effect">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Books</h3>
                    <p className="text-gray-600 text-sm">Add new textbooks and guides</p>
                  </div>
                </Link>

                <Link to="/guide-books" className="card glass-panel glow-effect">
                  <div className="text-center">
                    <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">View Books</h3>
                    <p className="text-gray-600 text-sm">Browse all available books</p>
                  </div>
                </Link>
              </div>
            )}

            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {user.userType === 'parent' ? 'Parent Dashboard' : 'Teacher Dashboard'}
              </h2>
              <p className="text-gray-600 mb-8">
                {user.userType === 'parent' 
                  ? 'Monitor your child\'s progress and performance'
                  : 'Manage your classes and educational content'
                }
              </p>
              
              {user.userType === 'parent' && (
                <div className="card max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
                  <p className="text-gray-600">
                    Advanced monitoring features are being developed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard