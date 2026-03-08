import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Brain, Users, Award } from 'lucide-react'

const LandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-[#e0e5ec] perspective-container overflow-x-hidden">
      {/* 3D Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      {/* Header - Mobile Responsive */}
      <header className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <nav className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">EduLearn</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <Link to="/login" className="btn btn-secondary w-full sm:w-auto text-center text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary w-full sm:w-auto text-center text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section - Mobile Responsive */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-3 md:mb-4 lg:mb-6 leading-tight px-2">
          Smart Learning Platform
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 lg:mb-12 max-w-3xl mx-auto px-4">
          Personalized education with AI-powered assistance, interactive quizzes, and comprehensive monitoring for students, parents, and teachers.
        </p>

        {/* Features Preview - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 lg:mb-16">
          <div className="card glass-panel text-center p-4 md:p-6 glow-effect floating" style={{ animationDelay: '0s' }}>
            <Brain className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm md:text-base text-gray-600">
              Get instant help with doubts, explanations, and personalized learning support
            </p>
          </div>
          
          <div className="card glass-panel text-center p-4 md:p-6 glow-effect floating" style={{ animationDelay: '0.2s' }}>
            <Award className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2">Interactive Quizzes</h3>
            <p className="text-sm md:text-base text-gray-600">
              Test your knowledge with chapter-wise and subject-wise assessments
            </p>
          </div>
          
          <div className="card glass-panel text-center p-4 md:p-6 glow-effect floating" style={{ animationDelay: '0.4s' }}>
            <Users className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2">Progress Monitoring</h3>
            <p className="text-sm md:text-base text-gray-600">
              Parents and teachers can track student progress and performance
            </p>
          </div>
        </div>

        {/* CTA Buttons - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 justify-center items-center px-4 max-w-2xl mx-auto">
          <Link 
            to="/register" 
            className="btn btn-primary text-sm md:text-base lg:text-lg px-6 md:px-8 py-2 md:py-3 lg:py-4 w-full sm:w-auto text-center"
          >
            Get Started Free
          </Link>
          <Link 
            to="/login" 
            className="btn btn-secondary text-sm md:text-base lg:text-lg px-6 md:px-8 py-2 md:py-3 lg:py-4 w-full sm:w-auto text-center"
          >
            Already have an account?
          </Link>
        </div>
      </main>

      {/* Footer - Mobile Responsive */}
      <footer className="container mx-auto px-4 md:px-6 py-6 md:py-8 text-center text-gray-600">
        <p className="text-xs sm:text-sm md:text-base">
          &copy; 2024 EduLearn. Empowering education through technology.
        </p>
      </footer>
    </div>
  )
}

export default LandingPage