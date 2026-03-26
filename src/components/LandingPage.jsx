import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Brain, Award, Users, Zap, BarChart2, ArrowRight } from 'lucide-react'

const features = [
  { icon: Brain, label: 'AI Assistant', color: '#4f46e5', bg: '#eef2ff' },
  { icon: Award, label: 'Quizzes', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Users, label: 'Live Classes', color: '#0891b2', bg: '#ecfeff' },
  { icon: BookOpen, label: 'Study Books', color: '#059669', bg: '#ecfdf5' },
  { icon: Zap, label: 'Career Sim', color: '#d97706', bg: '#fffbeb' },
  { icon: BarChart2, label: 'Analytics', color: '#db2777', bg: '#fdf2f8' },
]

const LandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  return (
    <div className="edu-page">
      {/* Navbar */}
      <nav className="edu-navbar">
        <div className="edu-navbar-inner">
          <div className="edu-logo">
            <div className="edu-logo-icon">
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <div className="edu-logo-text">EduLearn</div>
              <div className="edu-logo-sub">Smart Solutions</div>
            </div>
          </div>

          <ul className="edu-nav-links" style={{ display: 'flex' }}>
            <li><a href="#" className="active">HOME</a></li>
            <li><a href="#">ABOUT</a></li>
            <li><a href="#">SERVICE</a></li>
            <li><a href="#">CONTACT</a></li>
          </ul>

          <Link to="/register" className="edu-btn-cta">CONTACT US</Link>
        </div>
      </nav>

      {/* Hero Split */}
      <div className="edu-hero">
        {/* Left — light gray */}
        <div className="edu-hero-left">
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Grade 1 – 12 Platform
          </p>
          <h1 className="edu-hero-title">
            Empowering<br />
            Young Minds<br />
            From Grade One<br />
            To Twelve
          </h1>
          <p className="edu-hero-desc">
            Unlock your child's full academic potential with our comprehensive, curriculum-aligned platform designed to simplify learning and boost classroom performance across every single grade level.
          </p>
          <div className="edu-hero-btns">
            <Link to="/register" className="edu-btn-primary">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="edu-btn-outline">
              Sign In
            </Link>
          </div>
        </div>

        {/* Right — blue-purple gradient */}
        <div className="edu-hero-right">
          <div className="edu-illustration">
            <div className="edu-illustration-inner">
              {/* SVG Illustration */}
              <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '380px' }}>
                {/* Books stack */}
                <rect x="100" y="200" width="180" height="22" rx="4" fill="#f59e0b" />
                <rect x="110" y="180" width="160" height="22" rx="4" fill="#22c55e" />
                <rect x="120" y="160" width="140" height="22" rx="4" fill="#3b82f6" />
                <rect x="130" y="140" width="120" height="22" rx="4" fill="#8b5cf6" />
                {/* Ladder */}
                <rect x="230" y="80" width="8" height="140" rx="3" fill="rgba(255,255,255,0.6)" />
                <rect x="260" y="80" width="8" height="140" rx="3" fill="rgba(255,255,255,0.6)" />
                <rect x="230" y="100" width="38" height="6" rx="2" fill="rgba(255,255,255,0.5)" />
                <rect x="230" y="120" width="38" height="6" rx="2" fill="rgba(255,255,255,0.5)" />
                <rect x="230" y="140" width="38" height="6" rx="2" fill="rgba(255,255,255,0.5)" />
                <rect x="230" y="160" width="38" height="6" rx="2" fill="rgba(255,255,255,0.5)" />
                {/* Person sitting */}
                <circle cx="190" cy="118" r="18" fill="#fbbf24" />
                <rect x="170" y="136" width="40" height="28" rx="8" fill="#22c55e" />
                <rect x="155" y="148" width="30" height="10" rx="5" fill="#22c55e" />
                <rect x="195" y="148" width="30" height="10" rx="5" fill="#22c55e" />
                {/* Laptop */}
                <rect x="168" y="155" width="44" height="28" rx="4" fill="#1e293b" />
                <rect x="172" y="158" width="36" height="20" rx="2" fill="#38bdf8" />
                <rect x="160" y="183" width="60" height="5" rx="2" fill="#334155" />
                {/* Lightbulb */}
                <circle cx="310" cy="70" r="28" fill="#fbbf24" opacity="0.9" />
                <rect x="304" y="94" width="12" height="16" rx="3" fill="#f59e0b" />
                {/* Rays */}
                <line x1="310" y1="30" x2="310" y2="20" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <line x1="340" y1="42" x2="348" y2="34" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <line x1="350" y1="70" x2="362" y2="70" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <line x1="280" y1="42" x2="272" y2="34" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <line x1="270" y1="70" x2="258" y2="70" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                {/* Pencil */}
                <rect x="320" y="150" width="14" height="80" rx="4" fill="#22c55e" />
                <polygon points="320,230 334,230 327,250" fill="#fbbf24" />
                {/* Leaves */}
                <ellipse cx="80" cy="220" rx="30" ry="18" fill="#22c55e" opacity="0.7" transform="rotate(-20 80 220)" />
                <ellipse cx="60" cy="240" rx="22" ry="14" fill="#16a34a" opacity="0.6" transform="rotate(10 60 240)" />
              </svg>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', fontWeight: 600, marginTop: '16px' }}>
                AI-Powered Learning Platform
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '6px' }}>
                Personalized for every student
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: 'white', padding: '64px 0' }}>
        <div className="edu-main" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p className="edu-section-label">What We Offer</p>
            <h2 className="edu-section-title">
              Everything You Need to <span>Succeed</span>
            </h2>
          </div>
          <div className="edu-grid-3">
            {features.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="edu-card" style={{ textAlign: 'center', cursor: 'default' }}>
                <div className="edu-card-icon" style={{ background: bg, margin: '0 auto 14px' }}>
                  <Icon size={24} color={color} />
                </div>
                <div className="edu-card-title">{label}</div>
                <div className="edu-card-desc">
                  Comprehensive tools and resources to help students excel in every subject.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: 'var(--edu-gradient-hero)', padding: '56px 0' }}>
        <div className="edu-main" style={{ paddingTop: 0, paddingBottom: 0, textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '12px' }}>
            Ready to Start Learning?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', marginBottom: '28px' }}>
            Join thousands of students already learning on EduLearn
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '13px 32px', borderRadius: '10px', background: 'white',
              color: '#4f46e5', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}>
              Get Started Free
            </Link>
            <Link to="/login" style={{
              padding: '13px 32px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)',
              color: 'white', fontSize: '15px', fontWeight: 700, textDecoration: 'none'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', padding: '32px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          {/* Brand */}
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 6 }}>EduLearn</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Empowering education through technology.</div>
          </div>

          {/* About / License */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</div>
            <a
              href="https://github.com/jeevaakash232/ai-bharat-educational-platform/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseOver={e => e.currentTarget.style.color = 'white'}
              onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
            >
              {/* GitHub icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              MIT License
            </a>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</div>
            <a
              href="mailto:aibharath07@gmail.com"
              style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseOver={e => e.currentTarget.style.color = 'white'}
              onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              aibharath07@gmail.com
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', marginTop: 24, paddingTop: 16, textAlign: 'center' }}>
          <p style={{ color: '#4b5563', fontSize: 12 }}>© 2024 EduLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
