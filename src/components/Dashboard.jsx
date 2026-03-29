import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Brain, Award, LogOut, User, Book, Settings as SettingsIcon, Trash2, Video, Clock, TrendingUp, Sparkles, Briefcase, Heart, Target, Users, Search } from 'lucide-react'
import { initializeStudentData } from '../utils/autoDataPopulator'
import StudentMonitor from './StudentMonitor'

const Dashboard = () => {
  const { user, logout, predictions, predictionsLoading } = useAuth()
  const navigate = useNavigate()
  const [showMonitor, setShowMonitor] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const handleClearCache = async () => {
    if (!confirm('Clear all cache data?')) return
    try {
      const userData = localStorage.getItem('edulearn_user')
      const registeredUsers = localStorage.getItem('registeredUsers')
      localStorage.clear()
      if (userData) localStorage.setItem('edulearn_user', userData)
      if (registeredUsers) localStorage.setItem('registeredUsers', registeredUsers)
      if ('caches' in window) { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))) }
      if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())) }
      alert('Cache cleared! Reloading...')
      window.location.reload(true)
    } catch { alert('Cache cleared! Reloading...'); window.location.reload(true) }
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.userType === 'student') initializeStudentData(user)
  }, [user, navigate])

  if (!user) return null

  const quickActions = [
    { to: '/student-dashboard', icon: TrendingUp, label: 'My Performance', desc: 'AI-powered insights & predictions', color: '#4f46e5', bg: '#eef2ff', badge: predictions?.prediction ? `${predictions.prediction.predicted_score}%` : null },
    { to: '/ai-assistant', icon: Brain, label: 'AI Assistant', desc: 'Get help with doubts & explanations', color: '#7c3aed', bg: '#f5f3ff' },
    { to: '/enhanced-ai-assistant', icon: Sparkles, label: 'Enhanced AI', desc: 'Emotion-aware · Offline-ready', color: '#db2777', bg: '#fdf2f8' },
    { to: '/guide-books', icon: Book, label: 'Guide Books', desc: 'Access comprehensive study materials', color: '#059669', bg: '#ecfdf5' },
    { to: '/live-classes', icon: Video, label: 'Recorded Classes', desc: 'Watch educational video recordings', color: '#0891b2', bg: '#ecfeff' },
    { to: '/teacher-assistant', icon: Sparkles, label: 'Teacher Assistant', desc: 'AI-powered content generation', color: '#7c3aed', bg: '#f5f3ff' },
    { to: '/career-simulator', icon: Briefcase, label: 'Career Simulator', desc: 'Explore life after school', color: '#d97706', bg: '#fffbeb' },
    { to: '/auto-health-tracker', icon: Heart, label: 'Health Tracker', desc: 'Automatic wellness monitoring', color: '#e11d48', bg: '#fff1f2' },
    { to: '/discipline', icon: Target, label: 'Discipline Learning', desc: 'Build better habits & streaks', color: '#ea580c', bg: '#fff7ed' },
    { to: '/visualizations', icon: Brain, label: 'Visualizations', desc: 'Interactive animations & visual learning', color: '#0284c7', bg: '#f0f9ff' },
    { to: '/quiz', icon: Award, label: 'Quizzes', desc: 'Test your knowledge interactively', color: '#ca8a04', bg: '#fefce8' },
  ]

  return (
    <div className="edu-page">
      {/* Header */}
      <header className="edu-dashboard-header">
        <div className="edu-dashboard-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--edu-gradient)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e', lineHeight: 1 }}>EduLearn</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Smart Solutions</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f4f5f7', borderRadius: 8, fontSize: 13, color: '#374151', fontWeight: 600 }}>
              <User size={14} />
              <span className="capitalize">{user.userType}</span>
            </div>
            <button onClick={handleClearCache} title="Clear Cache" style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              <Trash2 size={14} /> <span className="hidden md:inline">Clear Cache</span>
            </button>
            <Link to="/settings" style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              <SettingsIcon size={14} /> <span className="hidden md:inline">Settings</span>
            </Link>
            <Link to="/history" style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
              <Clock size={14} /> <span className="hidden md:inline">History</span>
            </Link>
            <button onClick={handleLogout} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--edu-gradient)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'white', fontWeight: 700 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="edu-main">
        {/* Welcome Banner */}
        <div className="edu-welcome-banner">
          <h2>Welcome back, {user.name || user.email?.split('@')[0] || 'Student'}! 👋</h2>
          <p>Ready to continue your learning journey? Let's make today count.</p>
        </div>

        {/* Profile Info */}
        {user.userType === 'student' && user.profileComplete && (
          <div className="edu-card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#1a1a2e' }}>Your Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {[
                user.selectedState && ['State', user.selectedState],
                user.mediumName && ['Medium', user.mediumName],
                ['Board', user.board],
                ['Class', user.class],
                user.department && ['Department', user.department],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ background: '#f4f5f7', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions — students only */}
        {user.userType === 'student' && (
          <>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', marginBottom: 16 }}>Quick Actions</h3>
            <div className="edu-grid-4" style={{ marginBottom: 32 }}>
              {quickActions.map(({ to, icon: Icon, label, desc, color, bg, badge }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                  <div className="edu-card" style={{ height: '100%' }}>
                    <div className="edu-card-icon" style={{ background: bg }}>
                      <Icon size={22} color={color} />
                    </div>
                    <div className="edu-card-title">{label}</div>
                    <div className="edu-card-desc">{desc}</div>
                    {badge && (
                      <div style={{ marginTop: 10, display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: bg, color, fontSize: 13, fontWeight: 700 }}>
                        {badge}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Subjects */}
        {user.userType === 'student' && user.subjects && (
          <>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', marginBottom: 16 }}>Your Subjects</h3>
            <div className="edu-grid-3">
              {[...new Set(user.subjects)].map((subject) => (
                <Link key={subject} to={`/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration: 'none' }}>
                  <div className="edu-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--edu-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{subject.charAt(0)}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{subject}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>12 Chapters · 45% Progress</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Teacher / Parent */}
        {user.userType !== 'student' && (
          <div>
            {/* Monitor Student button — both teacher and parent */}
            <div style={{ marginBottom: 24 }}>
              <button onClick={() => setShowMonitor(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 14, background: 'var(--edu-gradient)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
                <Search size={18} /> Monitor Student by ID
              </button>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Enter a student's unique ID or email to view their profile and subjects</p>
            </div>

            {user.userType === 'teacher' && (
              <>
                {/* Teacher profile info */}
                {(user.selectedState || user.board || user.class) && (
                  <div className="edu-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#1a1a2e' }}>Your Teaching Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                      {[
                        user.selectedState && ['State', user.selectedState],
                        user.mediumName && ['Medium', user.mediumName],
                        user.board && ['Board', user.board],
                        user.class && ['Class', `Class ${user.class}`],
                      ].filter(Boolean).map(([k, v]) => (
                        <div key={k} style={{ background: '#f4f5f7', borderRadius: 8, padding: '10px 14px' }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', marginBottom: 16 }}>Teacher Tools</h3>
                <div className="edu-grid-3" style={{ marginBottom: 24 }}>
                  {[
                    { to: '/live-classes', icon: Video, label: 'Recorded Classes', desc: 'View all uploaded class recordings', color: '#0891b2', bg: '#ecfeff' },
                    { to: '/upload-recording', icon: Video, label: 'Upload Recording', desc: 'Upload a new class recording', color: '#4f46e5', bg: '#eef2ff' },
                    { to: '/teacher-assistant', icon: Sparkles, label: 'AI Content Generator', desc: 'Generate lessons, questions & notes', color: '#7c3aed', bg: '#f5f3ff' },
                    { to: '/admin', icon: BookOpen, label: 'Admin Panel', desc: 'Manage books and platform content', color: '#059669', bg: '#ecfdf5' },
                    { to: '/upload-books', icon: Book, label: 'Upload Books', desc: 'Add new textbooks and guides', color: '#d97706', bg: '#fffbeb' },
                    { to: '/guide-books', icon: Award, label: 'View Books', desc: 'Browse all available books', color: '#db2777', bg: '#fdf2f8' },
                  ].map(({ to, icon: Icon, label, desc, color, bg }) => (
                    <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                      <div className="edu-card">
                        <div className="edu-card-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
                        <div className="edu-card-title">{label}</div>
                        <div className="edu-card-desc">{desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {user.userType === 'parent' && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e', marginBottom: 16 }}>Parent Tools</h3>
                <div className="edu-grid-3" style={{ marginBottom: 24 }}>
                  {[
                    { to: '/guide-books', icon: Book, label: 'Study Books', desc: 'Browse books your child uses', color: '#059669', bg: '#ecfdf5' },
                    { to: '/live-classes', icon: Video, label: 'Recorded Classes', desc: 'Watch class recordings', color: '#0891b2', bg: '#ecfeff' },
                  ].map(({ to, icon: Icon, label, desc, color, bg }) => (
                    <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                      <div className="edu-card">
                        <div className="edu-card-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
                        <div className="edu-card-title">{label}</div>
                        <div className="edu-card-desc">{desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {showMonitor && <StudentMonitor onClose={() => setShowMonitor(false)} />}
      </main>
    </div>
  )
}

export default Dashboard
