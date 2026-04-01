import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle, XCircle, BookOpen, Brain, Trophy, Zap, Target, Home, TrendingUp, Lightbulb, RefreshCw, Globe } from 'lucide-react'
import { historyService } from '../services/historyService'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL } from '../config'
import { getSubjectsForClass } from '../data/curriculumStructure'

// Languages that are themselves regional language subjects
const REGIONAL_LANGUAGE_SUBJECTS = [
  'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali',
  'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu',
  'Sanskrit', 'Mizo', 'Manipuri', 'Konkani', 'Nepali',
  'Regional Language', 'Language I (Regional)', 'Language I',
]

// Derive the question language for a given subject + user profile
const resolveQuestionLanguage = (subject, user) => {
  const subjectClean = (subject || '').trim()
  const isRegionalSubject = REGIONAL_LANGUAGE_SUBJECTS.some(
    lang => subjectClean.toLowerCase() === lang.toLowerCase()
  )
  if (isRegionalSubject) {
    if (subjectClean.toLowerCase().includes('regional') || subjectClean.toLowerCase().includes('language i')) {
      return user?.stateLanguage || 'Tamil'
    }
    return subjectClean
  }
  // For other subjects use medium language
  const medium = user?.mediumName || user?.medium || 'English Medium'
  const motherTongue = medium.replace(' Medium', '').trim()
  return motherTongue || 'English'
}

// Get subjects for the user based on class, state language, and stream
const getUserSubjects = (user) => {
  const classNum = parseInt(user?.class) || 10
  const stateLanguage = user?.stateLanguage || 'Tamil'
  const stream = user?.department || user?.stream || null

  // For class 11/12 with no stream set, use the subjects already saved on the profile
  if ((classNum === 11 || classNum === 12) && !stream && user?.subjects?.length > 0) {
    return user.subjects
  }

  const subjects = getSubjectsForClass(classNum, stream, stateLanguage)

  // If still only common subjects (no stream matched), fall back to profile subjects
  if ((classNum === 11 || classNum === 12) && subjects.length <= 2 && user?.subjects?.length > 0) {
    return user.subjects
  }

  return subjects.map(s => s.name)
}

const Quiz = () => {
  const { subjectName } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [quizState, setQuizState] = useState('subject-selection')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedQuizType, setSelectedQuizType] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600)
  const [score, setScore] = useState(0)
  const [questions, setQuestions] = useState([])
  const [generationError, setGenerationError] = useState(null)

  if (!user) {
    return (
      <div className="edu-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="edu-card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>Please sign in to take a quiz</h2>
          <Link to="/login" className="edu-btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  const classNum = parseInt(user?.class) || 10
  const stateLanguage = user?.stateLanguage || 'Tamil'
  const questionLanguage = resolveQuestionLanguage(selectedSubject, user)
  const isMotherTongue = questionLanguage !== 'English'
  const userSubjects = getUserSubjects(user)

  useEffect(() => {
    if (subjectName && subjectName !== 'general') {
      // Convert slug back to display name and match against curriculum subjects
      const slug = subjectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      const match = userSubjects.find(s => s.toLowerCase() === slug.toLowerCase()) || slug
      setSelectedSubject(match)
      setQuizState('quiz-selection')
    }
    // If no subjectName or 'general', stay on subject-selection screen
  }, [subjectName])

  const quizTypes = [
    { id: 'quick-5',          name: 'Quick Quiz',      questions: 5,  time: '5 min',  difficulty: 'easy',   icon: Zap,      color: '#059669', bg: '#ecfdf5', desc: 'Fast and fun!' },
    { id: 'standard-10',      name: 'Standard Quiz',   questions: 10, time: '10 min', difficulty: 'medium', icon: BookOpen, color: '#4f46e5', bg: '#eef2ff', desc: 'Perfect practice' },
    { id: 'comprehensive-15', name: 'Comprehensive',   questions: 15, time: '15 min', difficulty: 'medium', icon: Brain,    color: '#7c3aed', bg: '#f5f3ff', desc: 'Test your knowledge' },
    { id: 'challenge-20',     name: 'Challenge Quiz',  questions: 20, time: '20 min', difficulty: 'hard',   icon: Trophy,   color: '#d97706', bg: '#fffbeb', desc: 'For champions!' },
  ]

  const generateAIQuestions = async (numQuestions, difficulty) => {
    setGenerationError(null)
    const board = user?.board || 'CBSE'

    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          classNum,
          board,
          numQuestions,
          difficulty,
          language: questionLanguage,
          stateLanguage,
          medium: user?.mediumName || 'English Medium',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Server error ${res.status}`)
      }
      const data = await res.json()
      if (!data.success || !data.questions?.length) throw new Error('No questions returned')
      return data.questions
    } catch (err) {
      throw new Error(err.message || 'Failed to generate questions')
    }
  }

  useEffect(() => {
    if (quizState === 'active' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
      return () => clearTimeout(t)
    } else if (timeLeft === 0 && quizState === 'active') {
      completeQuiz()
    }
  }, [timeLeft, quizState])

  const startQuiz = async (quizTypeId) => {
    const qt = quizTypes.find(q => q.id === quizTypeId)
    if (!qt) return
    setSelectedQuizType(quizTypeId)
    setQuizState('generating')
    setCurrentQuestion(0); setAnswers({})
    try {
      const generated = await generateAIQuestions(qt.questions, qt.difficulty)
      setQuestions(generated)
      setTimeLeft(qt.questions * 60)
      setQuizState('active')
    } catch (err) {
      setGenerationError(err.message)
      setQuizState('quiz-selection')
    }
  }

  const selectAnswer = (questionId, idx) => setAnswers(prev => ({ ...prev, [questionId]: idx }))

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(p => p + 1)
    else completeQuiz()
  }

  const completeQuiz = async () => {
    let correct = 0
    questions.forEach(q => { if (answers[q.id] === q.correct) correct++ })
    const finalScore = Math.round((correct / questions.length) * 100)
    setScore(finalScore)
    setQuizState('completed')
    if (user) {
      try {
        historyService.setUser(user.email || user.id)
        await historyService.trackQuizAttempt({
          quizId: selectedQuizType, subject: selectedSubject, class: user.class,
          totalQuestions: questions.length, correctAnswers: correct,
          score: finalScore, percentage: finalScore,
          timeTaken: (questions.length * 60) - timeLeft, answers,
          language: questionLanguage,
        })
      } catch {}
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const resetQuiz = () => { setQuestions([]); setAnswers({}); setCurrentQuestion(0); setScore(0) }

  // Language badge shown in header
  const LangBadge = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: isMotherTongue ? '#f5f3ff' : '#eef2ff', border: `1px solid ${isMotherTongue ? '#ddd6fe' : '#c7d2fe'}`, fontSize: 12, fontWeight: 700, color: isMotherTongue ? '#7c3aed' : '#4f46e5' }}>
      <Globe size={12} />
      {questionLanguage}
    </div>
  )

  // ── Subject Selection ──
  if (quizState === 'subject-selection') {
    return (
      <div className="edu-page">
        <header className="edu-dashboard-header">
          <div className="edu-dashboard-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'var(--edu-gradient)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>Quiz Arena</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Class {classNum} · {stateLanguage} · {user?.board || 'CBSE'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LangBadge />
              <Link to="/quiz-history" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <Clock size={14} /> History
              </Link>
            </div>
          </div>
        </header>

        <main className="edu-main">
          <div className="edu-welcome-banner" style={{ marginBottom: 24 }}>
            <h2>Pick Your Subject</h2>
            <p>
              Class {classNum} subjects · {stateLanguage} State Board
              {isMotherTongue && ` · Questions in ${questionLanguage}`}
            </p>
          </div>

          {/* Language info banner */}
          {isMotherTongue && (
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Globe size={18} color="#7c3aed" />
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#7c3aed' }}>Mother Tongue Mode: </span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>All quiz questions and answers will be in <strong>{questionLanguage}</strong> ({user?.mediumName})</span>
              </div>
            </div>
          )}

          {userSubjects.length > 0 ? (
            <div className="edu-grid-3">
              {userSubjects.map((subject) => {
                const subjectLang = resolveQuestionLanguage(subject, user)
                return (
                <button key={subject} onClick={() => { setSelectedSubject(subject); setQuizState('quiz-selection') }}
                  style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <div className="edu-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--edu-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{subject.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{subject}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        Class {classNum} · <span style={{ color: subjectLang !== 'English' ? '#7c3aed' : '#6b7280', fontWeight: subjectLang !== 'English' ? 700 : 400 }}>{subjectLang}</span>
                      </div>
                    </div>
                  </div>
                </button>
                )
              })}
            </div>
          ) : (
            <div className="edu-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <BookOpen size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No subjects found</h3>
              <p style={{ color: '#9ca3af', marginBottom: 20 }}>Complete your profile to get started</p>
              <Link to="/state-selection" className="edu-btn-primary">Set Up Profile</Link>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ── Quiz Type Selection ──
  if (quizState === 'quiz-selection') {
    return (
      <div className="edu-page">
        <header className="edu-dashboard-header">
          <div className="edu-dashboard-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => subjectName ? navigate('/dashboard') : setQuizState('subject-selection')}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowLeft size={16} color="#374151" />
              </button>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>{selectedSubject}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Class {classNum} · {user?.board || 'CBSE'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LangBadge />
              <Link to="/quiz-history" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <Clock size={14} /> History
              </Link>
            </div>
          </div>
        </header>

        <main className="edu-main">
          {generationError && (
            <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#991b1b', fontSize: 14, fontWeight: 600 }}>
              {generationError}
            </div>
          )}

          {/* AI + Language info */}
          <div className="edu-card" style={{ marginBottom: 24, background: 'var(--edu-gradient)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={22} color="white" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  AI Quiz · {selectedSubject} · Class {classNum}
                </div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                  {isMotherTongue
                    ? `Questions & answers in ${questionLanguage} (${user?.mediumName})`
                    : `Questions & answers in English`}
                  {' · '}{user?.board || 'CBSE'} curriculum
                </div>
              </div>
            </div>
          </div>

          <div className="edu-grid-2">
            {quizTypes.map(({ id, name, questions: qCount, time, difficulty, icon: Icon, color, bg, desc }) => (
              <div key={id} className="edu-card" style={{ cursor: 'pointer' }} onClick={() => startQuiz(id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div className="edu-card-icon" style={{ background: bg, margin: 0 }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{difficulty} difficulty</div>
                  </div>
                  <span style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 700 }}>{difficulty}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: '#f4f5f7', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Questions</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{qCount}</div>
                  </div>
                  <div style={{ flex: 1, background: '#f4f5f7', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Time</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{time}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>{desc}</div>
                <button style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'var(--edu-gradient)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Zap size={15} /> Start Quiz
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ── Generating ──
  if (quizState === 'generating') {
    return (
      <div className="edu-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="edu-card" style={{ textAlign: 'center', maxWidth: 440, padding: '48px 40px' }}>
          <RefreshCw size={48} color="#4f46e5" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>Generating Your Quiz</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
            AI is crafting <strong>{selectedSubject}</strong> questions for Class {classNum}…
          </p>
          {isMotherTongue && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 20 }}>
              <Globe size={13} /> Questions in {questionLanguage}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[0, 150, 300].map(d => (
              <span key={d} style={{ width: 10, height: 10, borderRadius: '50%', background: '#4f46e5', display: 'inline-block', animation: `pulse 1.2s ease-in-out ${d}ms infinite` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Active Quiz ──
  if (quizState === 'active') {
    const question = questions[currentQuestion]
    if (!question) return <div>Loading…</div>
    const progress = Math.round(((currentQuestion + 1) / questions.length) * 100)
    const optionLabels = ['A', 'B', 'C', 'D']
    const optionColors = ['#4f46e5', '#059669', '#d97706', '#7c3aed']
    const optionBgs = ['#eef2ff', '#ecfdf5', '#fffbeb', '#f5f3ff']

    return (
      <div className="edu-page">
        <header className="edu-dashboard-header">
          <div className="edu-dashboard-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => { if (window.confirm('Exit quiz? Progress will be lost.')) { setQuizState('quiz-selection'); resetQuiz() } }}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowLeft size={16} color="#374151" />
              </button>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>{selectedSubject}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Q{currentQuestion + 1}/{questions.length}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LangBadge />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: timeLeft < 60 ? '#fff1f2' : '#eef2ff', border: `1px solid ${timeLeft < 60 ? '#fca5a5' : '#c7d2fe'}` }}>
                <Clock size={16} color={timeLeft < 60 ? '#ef4444' : '#4f46e5'} />
                <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: timeLeft < 60 ? '#ef4444' : '#4f46e5' }}>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="edu-main" style={{ maxWidth: 760 }}>
          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
              <span>Progress</span><span>{progress}%</span>
            </div>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--edu-gradient)', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Question */}
          <div className="edu-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--edu-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>Q{currentQuestion + 1}</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.6 }}>{question.question}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {question.options.map((option, idx) => {
                const isSelected = answers[question.id] === idx
                return (
                  <button key={idx} onClick={() => selectAnswer(question.id, idx)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `2px solid ${isSelected ? optionColors[idx] : '#e5e7eb'}`, background: isSelected ? optionBgs[idx] : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: isSelected ? optionColors[idx] : '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: isSelected ? 'white' : '#6b7280' }}>
                        {isSelected ? '✓' : optionLabels[idx]}
                      </span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: isSelected ? 700 : 500, color: isSelected ? optionColors[idx] : '#1a1a2e' }}>{option}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#374151', opacity: currentQuestion === 0 ? 0.4 : 1 }}>
              <ArrowLeft size={15} /> Previous
            </button>
            {answers[question.id] !== undefined
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: 13, fontWeight: 600, color: '#059669' }}><CheckCircle size={15} /> Answer selected</div>
              : <div style={{ fontSize: 13, color: '#9ca3af' }}>Select an answer to continue</div>
            }
            <button onClick={nextQuestion} disabled={answers[question.id] === undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, background: 'var(--edu-gradient)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'white', opacity: answers[question.id] === undefined ? 0.4 : 1 }}>
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'} <Zap size={15} />
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Completed ──
  if (quizState === 'completed') {
    const correctCount = questions.filter(q => answers[q.id] === q.correct).length
    const incorrectCount = questions.filter(q => answers[q.id] !== q.correct && answers[q.id] !== undefined).length
    const skippedCount = questions.filter(q => answers[q.id] === undefined).length
    const scoreColor = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#ef4444'
    const scoreLabel = score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Work!' : 'Keep Practicing!'

    return (
      <div className="edu-page">
        <header className="edu-dashboard-header">
          <div className="edu-dashboard-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'var(--edu-gradient)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>Quiz Complete</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{selectedSubject} · Class {classNum}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LangBadge />
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <Home size={14} /> Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="edu-main" style={{ maxWidth: 760 }}>
          {/* Score Banner */}
          <div style={{ background: 'var(--edu-gradient)', borderRadius: 20, padding: '32px', color: 'white', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>{score}%</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8, opacity: 0.9 }}>{scoreLabel}</div>
            <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>{correctCount} of {questions.length} correct · {questionLanguage}</div>
          </div>

          {/* Stats */}
          <div className="edu-grid-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Correct', value: correctCount, color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
              { label: 'Incorrect', value: incorrectCount, color: '#ef4444', bg: '#fff1f2', icon: XCircle },
              { label: 'Skipped', value: skippedCount, color: '#6b7280', bg: '#f4f5f7', icon: Target },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="edu-card" style={{ textAlign: 'center' }}>
                <div className="edu-card-icon" style={{ background: bg, margin: '0 auto 12px' }}><Icon size={22} color={color} /></div>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Answer Review */}
          <div className="edu-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Lightbulb size={20} color="#d97706" />
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e' }}>Answer Review</h3>
              {isMotherTongue && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#7c3aed' }}>
                  <Globe size={12} /> {questionLanguage}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q, i) => {
                const userAns = answers[q.id]
                const isCorrect = userAns === q.correct
                const wasSkipped = userAns === undefined
                const borderColor = isCorrect ? '#a7f3d0' : wasSkipped ? '#e5e7eb' : '#fca5a5'
                const bgColor = isCorrect ? '#f0fdf4' : wasSkipped ? '#f9fafb' : '#fff1f2'
                return (
                  <div key={q.id} style={{ border: `1px solid ${borderColor}`, background: bgColor, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: isCorrect ? '#059669' : wasSkipped ? '#6b7280' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: 12 }}>{i + 1}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.6 }}>{q.question}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: q.explanation ? 12 : 0 }}>
                      {q.options.map((opt, oi) => {
                        const isUser = userAns === oi
                        const isRight = q.correct === oi
                        return (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${isRight ? '#a7f3d0' : isUser && !isCorrect ? '#fca5a5' : '#e5e7eb'}`, background: isRight ? '#ecfdf5' : isUser && !isCorrect ? '#fff1f2' : 'white' }}>
                            <span style={{ width: 22, height: 22, borderRadius: 6, background: isRight ? '#059669' : isUser && !isCorrect ? '#ef4444' : '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isRight || (isUser && !isCorrect) ? 'white' : '#6b7280', flexShrink: 0 }}>
                              {['A','B','C','D'][oi]}
                            </span>
                            <span style={{ fontSize: 13, color: '#1a1a2e', flex: 1 }}>{opt}</span>
                            {isRight && <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>✓ Correct</span>}
                            {isUser && !isCorrect && <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>✗ Your answer</span>}
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <div style={{ background: 'white', borderRadius: 8, padding: '12px 14px', border: '1px solid #e5e7eb', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 700, color: '#4f46e5' }}>Explanation: </span>{q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="edu-grid-2">
            <button onClick={() => { resetQuiz(); setQuizState('quiz-selection') }}
              style={{ padding: '14px', borderRadius: 12, background: 'var(--edu-gradient)', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Zap size={16} /> Take Another Quiz
            </button>
            <button onClick={() => { resetQuiz(); setSelectedSubject(''); setQuizState('subject-selection') }}
              style={{ padding: '14px', borderRadius: 12, background: 'white', color: '#4f46e5', border: '2px solid #4f46e5', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <BookOpen size={16} /> Change Subject
            </button>
            <Link to="/quiz-history" style={{ padding: '14px', borderRadius: 12, background: '#f4f5f7', color: '#374151', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <TrendingUp size={16} /> View History
            </Link>
            <Link to="/ai-assistant" style={{ padding: '14px', borderRadius: 12, background: '#f4f5f7', color: '#374151', border: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Brain size={16} /> AI Assistant
            </Link>
          </div>
        </main>
      </div>
    )
  }
}

export default Quiz
