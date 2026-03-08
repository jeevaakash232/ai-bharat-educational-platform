import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Award, CheckCircle, XCircle, Sparkles, BookOpen, Brain, Star, Trophy, Zap, Target, Home, TrendingUp, Lightbulb, Rocket, Heart } from 'lucide-react'
import { historyService } from '../services/historyService'
import { useAuth } from '../contexts/AuthContext'
import { getBedrockResponse } from '../services/bedrockService'

const Quiz = () => {
  const { subjectName } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayName = subjectName ? subjectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
  
  const [quizState, setQuizState] = useState('subject-selection') // subject-selection, quiz-selection, generating, active, completed
  const [selectedSubject, setSelectedSubject] = useState(subjectName || '')
  const [selectedQuizType, setSelectedQuizType] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [score, setScore] = useState(0)
  const [questions, setQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to take a quiz</h2>
          <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Get user's subjects
  const userSubjects = user?.subjects || []
  
  // If coming from subject page, skip subject selection
  useEffect(() => {
    if (subjectName) {
      setSelectedSubject(subjectName)
      setQuizState('quiz-selection')
    }
  }, [subjectName])

  // Quiz types with AI generation
  const quizTypes = [
    { 
      id: 'quick-5', 
      name: 'Quick Quiz', 
      questions: 5, 
      time: '5 min', 
      difficulty: 'easy',
      icon: Zap,
      color: 'green',
      emoji: '⚡',
      description: 'Fast and fun!'
    },
    { 
      id: 'standard-10', 
      name: 'Standard Quiz', 
      questions: 10, 
      time: '10 min', 
      difficulty: 'medium',
      icon: BookOpen,
      color: 'blue',
      emoji: '📚',
      description: 'Perfect practice'
    },
    { 
      id: 'comprehensive-15', 
      name: 'Comprehensive Quiz', 
      questions: 15, 
      time: '15 min', 
      difficulty: 'medium',
      icon: Brain,
      color: 'purple',
      emoji: '🧠',
      description: 'Test your knowledge'
    },
    { 
      id: 'challenge-20', 
      name: 'Challenge Quiz', 
      questions: 20, 
      time: '20 min', 
      difficulty: 'hard',
      icon: Trophy,
      color: 'orange',
      emoji: '🏆',
      description: 'For champions!'
    }
  ]

  // Generate AI questions based on class and subject
  const generateAIQuestions = async (numQuestions, difficulty) => {
    setIsGenerating(true)
    setGenerationError(null)
    
    const subjectDisplayName = selectedSubject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const classNum = user?.class || '10'
    const userState = user?.state || 'India'
    const userBoard = user?.board || 'CBSE'
    
    // Get user's mother tongue from medium selection
    const userMedium = user?.mediumName || user?.medium || 'English Medium'
    const motherTongue = userMedium.replace(' Medium', '').trim()
    
    console.log('🎯 Quiz Generation Context:', {
      subject: subjectDisplayName,
      class: classNum,
      state: userState,
      board: userBoard,
      medium: userMedium,
      motherTongue: motherTongue
    })
    
    // Determine if this is a regional language subject
    const regionalLanguages = ['Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu']
    const isRegionalLanguage = regionalLanguages.includes(subjectDisplayName)
    
    // Determine question language
    // If mother tongue is selected (not English), use mother tongue for ALL subjects
    const questionLanguage = motherTongue !== 'English' ? motherTongue : 'English'
    
    console.log(`📝 Question Language: ${questionLanguage} (Mother Tongue: ${motherTongue})`)
    
    // Create subject-specific context based on class level
    const subjectContext = {
      'Mathematics': `Focus on: Numbers 1-20, counting objects, simple addition (1+1, 2+3), simple subtraction, basic shapes (circle, square, triangle), patterns, comparing sizes (big/small, more/less).`,
      'English': `Focus on: English alphabet (A-Z), vowels and consonants, simple 3-letter words (cat, dog, sun), basic grammar (is/are, a/an), simple sentences, rhyming words.`,
      'Tamil': `Focus on: Tamil vowels (உயிர் எழுத்துக்கள்), Tamil consonants (மெய் எழுத்துக்கள்), simple Tamil words, basic Tamil sentences, Tamil numbers 1-10, common Tamil objects and animals.`,
      'Environmental Science (EVS)': `Focus on: Parts of body, family members, animals (domestic and wild), birds, plants and trees, fruits and vegetables, seasons, water sources, good habits.`,
      'Science': `Focus on: Living and non-living things, plants and animals, parts of plants, food we eat, water and air, day and night, sun moon and stars.`,
      'Social Science': `Focus on: My family, my school, my neighborhood, festivals, national symbols, good manners, helping others, community helpers.`,
    }
    
    const context = subjectContext[subjectDisplayName] || `Focus on core concepts and topics from ${subjectDisplayName} curriculum for Class ${classNum} as per ${userBoard} board in ${userState}.`
    
    // Language instruction for the AI - CRITICAL
    const languageInstruction = questionLanguage !== 'English'
      ? `
🔴 CRITICAL LANGUAGE REQUIREMENT - MUST FOLLOW STRICTLY:
- Student's Mother Tongue: ${questionLanguage}
- Student's Medium: ${userMedium}
- ALL questions MUST be written in ${questionLanguage} language using ${questionLanguage} script
- ALL options MUST be in ${questionLanguage} language
- ALL explanations MUST be in ${questionLanguage} language
- Do NOT use English or any other language except for JSON structure keys
- Use proper ${questionLanguage} script (not transliteration or romanization)
- This student learns in ${questionLanguage} medium, so everything must be in ${questionLanguage}

Example for Tamil:
✅ CORRECT: "எத்தனை உயிர் எழுத்துக்கள் உள்ளன?"
❌ WRONG: "How many vowels are there?"
❌ WRONG: "Ethanai uyir ezhuthukkal ullana?" (transliteration)

Example for Hindi:
✅ CORRECT: "1 + 1 का उत्तर क्या है?"
❌ WRONG: "What is 1 + 1?"
❌ WRONG: "1 + 1 ka uttar kya hai?" (transliteration)
`
      : `Write all questions, options, and explanations in English.`
    
    try {
      const prompt = `You are creating a quiz for a Class ${classNum} student studying ${subjectDisplayName}.

STUDENT CONTEXT:
- CLASS: ${classNum}
- SUBJECT: ${subjectDisplayName}
- STATE: ${userState}
- BOARD: ${userBoard}
- MOTHER TONGUE: ${questionLanguage}
- MEDIUM: ${userMedium}

QUIZ PARAMETERS:
- DIFFICULTY: ${difficulty}
- NUMBER OF QUESTIONS: ${numQuestions}
- QUESTION LANGUAGE: ${questionLanguage}

${languageInstruction}

CURRICULUM CONTEXT:
${context}

STATE & BOARD SPECIFIC REQUIREMENTS:
- Questions must align with ${userBoard} board curriculum for ${userState}
- Use examples and context relevant to ${userState} (local festivals, geography, culture when applicable)
- Difficulty level appropriate for Class ${classNum} students in ${userState}

CRITICAL REQUIREMENTS:
1. 🔴 MOST IMPORTANT: Write EVERYTHING in ${questionLanguage} language using ${questionLanguage} script
2. ALL questions MUST be DIRECTLY about ${subjectDisplayName} subject content
3. Questions MUST match Class ${classNum} ${userBoard} curriculum (age ${parseInt(classNum) + 5} years)
4. Use VERY simple, clear language in ${questionLanguage}
5. NO generic questions - ONLY ${subjectDisplayName}-specific questions for ${userBoard} board
6. Each question must have exactly 4 options
7. Only ONE option should be correct
8. Include state-specific examples when relevant (e.g., local festivals, geography for ${userState})

SPECIFIC EXAMPLES FOR ${subjectDisplayName} in ${questionLanguage}:
${subjectDisplayName === 'Tamil' ? `
🔴 ALL QUESTIONS MUST BE IN TAMIL SCRIPT LIKE THESE:

Question 1:
"எத்தனை உயிர் எழுத்துக்கள் உள்ளன?"
Options: ["10", "12", "18", "20"]
Correct: 1
Explanation: "தமிழில் 12 உயிர் எழுத்துக்கள் உள்ளன: அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ"

Question 2:
"இது என்ன எழுத்து: அ?"
Options: ["உயிர் எழுத்து", "மெய் எழுத்து", "உயிர்மெய் எழுத்து", "எண்"]
Correct: 0
Explanation: "அ என்பது உயிர் எழுத்து. இது தமிழின் முதல் உயிர் எழுத்து."

🔴 DO NOT write in English like "How many vowels in Tamil?"
🔴 DO NOT use transliteration like "Ethanai uyir ezhuthukkal?"
🔴 ONLY use Tamil script: எத்தனை உயிர் எழுத்துக்கள்?
` : questionLanguage === 'Tamil' && subjectDisplayName === 'Mathematics' ? `
🔴 ALL QUESTIONS MUST BE IN TAMIL:

"1 + 1 என்றால் என்ன?"
Options: ["1", "2", "3", "4"]
Correct: 1
Explanation: "1 + 1 = 2. ஒன்று கூட்டல் ஒன்று சமம் இரண்டு."

"சதுரத்திற்கு எத்தனை பக்கங்கள் உள்ளன?"
Options: ["3", "4", "5", "6"]
Correct: 1
Explanation: "சதுரத்திற்கு 4 பக்கங்கள் உள்ளன. எல்லா பக்கங்களும் சமமாக இருக்கும்."
` : questionLanguage === 'Hindi' && subjectDisplayName === 'Mathematics' ? `
🔴 ALL QUESTIONS MUST BE IN HINDI:

"1 + 1 का उत्तर क्या है?"
Options: ["1", "2", "3", "4"]
Correct: 1
Explanation: "1 + 1 = 2. एक और एक मिलकर दो होते हैं।"

"वर्ग की कितनी भुजाएँ होती हैं?"
Options: ["3", "4", "5", "6"]
Correct: 1
Explanation: "वर्ग की 4 भुजाएँ होती हैं। सभी भुजाएँ बराबर होती हैं।"
` : subjectDisplayName === 'Mathematics' && questionLanguage === 'English' ? `
- "What is 1 + 1?" Options: ["1", "2", "3", "4"]
- "How many sides does a square have?" Options: ["3", "4", "5", "6"]
- "Which is bigger: 5 or 3?" Options: ["5", "3", "Both same", "Cannot tell"]
- "What comes after 7?" Options: ["6", "7", "8", "9"]
` : subjectDisplayName === 'English' ? `
- "What is the first letter of 'Apple'?" Options: ["A", "B", "C", "D"]
- "Which is a vowel?" Options: ["A", "B", "C", "D"]
- "Complete: The ___ is red." Options: ["cat", "dog", "ball", "tree"]
- "What is the opposite of 'big'?" Options: ["small", "large", "huge", "tall"]
` : `
- Create questions testing core ${subjectDisplayName} concepts in ${questionLanguage}
- Use concrete examples from Class ${classNum} ${userBoard} textbooks
- Focus on fundamental knowledge relevant to ${userState}
`}

DO NOT CREATE:
- Generic questions not related to ${subjectDisplayName}
- Questions too difficult or too easy for Class ${classNum}
- Questions with unclear options
- ${questionLanguage !== 'English' ? 'Questions in English (use ' + questionLanguage + ' only!)' : ''}
- Questions not aligned with ${userBoard} board curriculum

Format your response as a JSON array with this EXACT structure:
[
  {
    "id": 1,
    "question": "Clear ${subjectDisplayName}-specific question in ${questionLanguage}?",
    "options": [
      "First option in ${questionLanguage}",
      "Second option in ${questionLanguage}",
      "Third option in ${questionLanguage}",
      "Fourth option in ${questionLanguage}"
    ],
    "correct": 0,
    "explanation": "Explanation in ${questionLanguage} - ${subjectDisplayName === 'Mathematics' ? 'DETAILED STEP-BY-STEP SOLUTION with all working steps' : 'Why this answer is correct'}"
  }
]

${subjectDisplayName === 'Mathematics' ? `
IMPORTANT FOR MATHEMATICS:
- Provide COMPLETE step-by-step solutions in ${questionLanguage}
- Show ALL working steps, don't skip any calculations
- Explain WHY each step is done
- Include formulas used
- Add "Key Concept" to help students remember
- Add "Common Mistake" to warn about typical errors
- Use clear mathematical notation
- Make it exam-preparation ready for ${userBoard} board
` : ''}

CRITICAL: Return ONLY the JSON array. No markdown, no code blocks, no extra text. Just the JSON array starting with [ and ending with ].`

      console.log(`🤖 Generating ${numQuestions} AI quiz questions for ${subjectDisplayName} in ${questionLanguage}...`)
      console.log(`📚 Context: Class ${classNum}, ${userBoard} Board, ${userState}`)
      
      const response = await getBedrockResponse(prompt, {
        name: user?.name,
        class: user?.class,
        board: user?.board,
        subjects: user?.subjects,
        state: user?.state,
        medium: userMedium,
        motherTongue: questionLanguage
      })

      // Parse the AI response
      let parsedQuestions
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0])
        } else {
          parsedQuestions = JSON.parse(response)
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        console.error('Raw response:', response)
        throw new Error('Failed to generate valid questions. Please try again.')
      }

      // Validate questions
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error('No questions generated. Please try again.')
      }

      // Ensure all questions have required fields
      const validQuestions = parsedQuestions.filter(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        typeof q.correct === 'number' &&
        q.correct >= 0 &&
        q.correct < 4
      )

      if (validQuestions.length === 0) {
        console.error('❌ No valid questions after filtering')
        console.error('Parsed questions:', parsedQuestions)
        throw new Error('Generated questions are invalid. Please try again.')
      }

      console.log(`✅ Generated ${validQuestions.length} valid questions for ${subjectDisplayName} in ${questionLanguage}`)
      console.log('Sample question:', validQuestions[0])
      
      setQuestions(validQuestions)
      setIsGenerating(false)
      return validQuestions

    } catch (error) {
      console.error('❌ Error generating questions:', error)
      console.error('Error details:', error.message)
      setGenerationError(error.message || 'Failed to generate questions')
      setIsGenerating(false)
      setQuizState('quiz-selection') // Go back to quiz selection on error
      throw error
    }
  }

  // Timer effect
  useEffect(() => {
    if (quizState === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizState === 'active') {
      completeQuiz()
    }
  }, [timeLeft, quizState])

  const startQuiz = async (quizType) => {
    const selectedQuiz = quizTypes.find(q => q.id === quizType)
    if (!selectedQuiz) return

    setSelectedQuizType(quizType)
    setQuizState('generating')
    setCurrentQuestion(0)
    setAnswers({})
    
    try {
      // Generate AI questions
      const generatedQuestions = await generateAIQuestions(
        selectedQuiz.questions,
        selectedQuiz.difficulty
      )
      
      // Set timer based on number of questions (1 minute per question)
      setTimeLeft(selectedQuiz.questions * 60)
      setQuizState('active')
    } catch (error) {
      console.error('Failed to start quiz:', error)
      setQuizState('selection')
    }
  }

  const selectAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz()
    }
  }

  const completeQuiz = async () => {
    const subjectDisplayName = selectedSubject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    // Calculate score
    let correctAnswers = 0
    questions.forEach(question => {
      if (answers[question.id] === question.correct) {
        correctAnswers++
      }
    })
    const finalScore = Math.round((correctAnswers / questions.length) * 100)
    setScore(finalScore)
    setQuizState('completed')

    // Track quiz attempt
    if (user) {
      try {
        historyService.setUser(user.email || user.id)
        await historyService.trackQuizAttempt({
          quizId: selectedQuizType,
          subject: subjectDisplayName,
          class: user.class,
          totalQuestions: questions.length,
          correctAnswers: correctAnswers,
          score: finalScore,
          percentage: finalScore,
          timeTaken: (questions.length * 60) - timeLeft,
          answers: answers
        })
        console.log('📝 Quiz attempt tracked')
      } catch (error) {
        console.error('Error tracking quiz attempt:', error)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Subject Selection Screen
  if (quizState === 'subject-selection') {
    // Subject emojis for visual appeal
    const subjectEmojis = {
      'tamil': '🔤',
      'english': '📖',
      'mathematics': '🔢',
      'environmental-science-(evs)': '🌱',
      'science': '🔬',
      'social-science': '🌍',
      'physics': '⚛️',
      'chemistry': '🧪',
      'biology': '🧬',
      'history': '📜',
      'geography': '🗺️',
      'computer-science': '💻',
      'commerce': '💼',
      'economics': '📊'
    }

    const subjectColors = {
      'tamil': 'from-rose-400 via-pink-500 to-red-500',
      'english': 'from-blue-400 via-indigo-500 to-purple-500',
      'mathematics': 'from-purple-400 via-violet-500 to-fuchsia-500',
      'environmental-science-(evs)': 'from-green-400 via-emerald-500 to-teal-500',
      'science': 'from-cyan-400 via-sky-500 to-blue-500',
      'social-science': 'from-orange-400 via-amber-500 to-yellow-500',
      'physics': 'from-indigo-400 via-blue-500 to-cyan-500',
      'chemistry': 'from-yellow-400 via-orange-500 to-red-500',
      'biology': 'from-green-400 via-lime-500 to-emerald-500',
      'history': 'from-amber-400 via-orange-500 to-red-500',
      'geography': 'from-teal-400 via-cyan-500 to-blue-500',
      'computer-science': 'from-slate-400 via-gray-500 to-zinc-500',
      'commerce': 'from-blue-400 via-indigo-500 to-purple-500',
      'economics': 'from-green-400 via-teal-500 to-cyan-500'
    }
    
    return (
      <div className="min-h-screen bg-[#e0e5ec] perspective-container overflow-hidden relative">
        {/* 3D Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <header className="relative bg-white/80 backdrop-blur-lg shadow-xl border-b-4 border-gradient-to-r from-purple-500 to-pink-500">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="group flex items-center justify-center w-12 h-12 quiz-grad-comp rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110">
                  <Home className="h-6 w-6" style={{ stroke: '#FFFFFF', fill: 'none' }} />
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 quiz-grad-yellow rounded-2xl blur opacity-75 animate-pulse"></div>
                    <div className="relative quiz-grad-yellow p-3 rounded-2xl shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-grad-purple">
                      Quiz Arena
                    </h1>
                    <p className="text-sm font-semibold text-gray-600 flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>Choose your challenge!</span>
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/quiz-history"
                className="group flex items-center space-x-2 px-6 py-3 quiz-grad-standard rounded-xl transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 font-bold"
                style={{ color: '#FFFFFF' }}
              >
                <Clock className="h-5 w-5" style={{ stroke: '#FFFFFF', fill: 'none' }} />
                <span style={{ color: '#FFFFFF' }}>History</span>
                <TrendingUp className="h-4 w-4 opacity-75" style={{ stroke: '#FFFFFF', fill: 'none' }} />
              </Link>
            </div>
          </div>
        </header>

        <main className="relative container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative text-8xl animate-bounce">🎯</div>
                </div>
              </div>
              <h2 className="text-5xl font-black text-black mb-4">
                Pick Your Subject
              </h2>
              <p className="text-xl font-black text-black">
                Start your learning adventure today! 🚀
              </p>
            </div>
            
            {userSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userSubjects.map((subject, index) => {
                  const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-')
                  const emoji = subjectEmojis[subjectSlug] || '�'
                  const gradient = subjectColors[subjectSlug] || 'from-gray-400 to-gray-600'
                  
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedSubject(subjectSlug)
                        setQuizState('quiz-selection')
                      }}
                      className="group glass-panel relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 glow-effect"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Gradient Background under glass layer */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 transition-opacity`}></div>
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      {/* Content */}
                      <div className="relative p-8 glow-effect">
                        <div className="text-7xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                          {emoji}
                        </div>
                        <h3 className="text-2xl font-black mb-3 text-gray-800">{subject}</h3>
                        <div className="flex items-center justify-center space-x-2 text-gray-700 mb-4">
                          <Star className="h-5 w-5 fill-current text-yellow-500" />
                          <span className="text-sm font-bold">Class {user?.class || '10'}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-4 py-2 border-2 border-indigo-300">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-bold text-gray-800">AI Powered</span>
                        </div>
                      </div>
                      
                      {/* Bottom Accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/50"></div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-4 border-purple-200">
                  <div className="text-8xl mb-6 animate-bounce">😕</div>
                  <h3 className="text-2xl font-bold text-black mb-4">No Subjects Found</h3>
                  <p className="text-black mb-8 text-lg font-semibold">Let's set up your profile first!</p>
                  <Link 
                    to="/profile-setup" 
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    <Rocket className="h-6 w-6" />
                    <span>Complete Profile</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Quiz Selection Screen
  if (quizState === 'quiz-selection') {
    const subjectDisplayName = selectedSubject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    const quizTypeDesigns = {
      'quick-5': { 
        gradient: 'quiz-grad-quick',
        shadow: 'shadow-green-500/50',
        icon: '⚡',
        pattern: 'Quick & Easy'
      },
      'standard-10': { 
        gradient: 'quiz-grad-standard',
        shadow: 'shadow-blue-500/50',
        icon: '📚',
        pattern: 'Balanced'
      },
      'comprehensive-15': { 
        gradient: 'quiz-grad-comp',
        shadow: 'shadow-purple-500/50',
        icon: '🧠',
        pattern: 'Deep Dive'
      },
      'challenge-20': { 
        gradient: 'quiz-grad-chall',
        shadow: 'shadow-orange-500/50',
        icon: '🏆',
        pattern: 'Ultimate Test'
      }
    }
    
    return (
      <div className="min-h-screen bg-[#e0e5ec] perspective-container relative overflow-hidden">
        {/* 3D Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <header className="relative bg-white/80 backdrop-blur-lg shadow-xl border-b-4 border-gradient-to-r from-blue-500 to-purple-500">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    console.log('Back button clicked, subjectName:', subjectName)
                    if (subjectName) {
                      // If came from subject page, go back to dashboard
                      console.log('Navigating to dashboard')
                      navigate('/dashboard')
                    } else {
                      // Otherwise go back to subject selection
                      console.log('Going to subject selection')
                      setQuizState('subject-selection')
                    }
                  }}
                  className="group flex items-center justify-center w-12 h-12 quiz-grad-standard rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110"
                >
                  <ArrowLeft className="h-6 w-6" style={{ stroke: '#FFFFFF', fill: 'none' }} />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 quiz-grad-yellow rounded-2xl blur opacity-75 animate-pulse"></div>
                    <div className="relative quiz-grad-yellow p-3 rounded-2xl shadow-lg">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-grad-blue">
                      {subjectDisplayName}
                    </h1>
                    <p className="text-sm font-semibold text-gray-600 flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>AI Questions • Class {user?.class || '10'}</span>
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/quiz-history"
                className="group flex items-center space-x-2 px-6 py-3 quiz-grad-standard text-white rounded-xl transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 font-bold"
              >
                <Clock className="h-5 w-5 text-white" />
                <span>History</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="relative container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto z-10 relative">
            {/* Subject Selector Card - High Contrast */}
            <div className="glass-panel glow-effect rounded-3xl p-8 mb-10 border border-white/40 shadow-2xl relative overflow-hidden">
              
              <div className="relative">
                <div className="flex items-center justify-center space-x-3 mb-5">
                  <div className="quiz-grad-standard p-3 rounded-2xl shadow-xl">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <label className="text-2xl font-black text-gray-800">
                    Select Your Subject
                  </label>
                </div>
                
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-6 py-4 border border-white/50 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-600 text-xl font-black bg-white/50 backdrop-blur-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  style={{ color: '#000000', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%234f46e5\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '4rem' }}
                >
                  {userSubjects.map((subject) => {
                    const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-')
                    return (
                      <option key={subject} value={subjectSlug} className="font-bold bg-white py-3" style={{ color: '#000000' }}>
                        {subject}
                      </option>
                    )
                  })}
                </select>
                
                <div className="mt-5 flex items-center justify-center space-x-2 bg-white/40 py-3 px-5 rounded-2xl backdrop-blur-sm border border-white/60">
                  <Lightbulb className="h-5 w-5 text-indigo-600 animate-pulse" />
                  <p className="text-base font-bold text-gray-800">Switch subjects anytime to explore different topics!</p>
                </div>
              </div>
            </div>

            {/* AI Info Banner - High Contrast */}
            <div className="relative overflow-hidden quiz-grad-comp rounded-3xl p-6 md:p-8 mb-10 shadow-2xl border-4 border-white/50">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="text-6xl md:text-7xl animate-bounce drop-shadow-2xl">🤖</div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-black mb-3 flex flex-col sm:flex-row items-center justify-center md:justify-start sm:space-x-2 drop-shadow-lg" style={{ color: '#FFFFFF' }}>
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                    <span>AI-Powered Quiz System</span>
                  </h3>
                  <p className="text-base md:text-lg font-bold drop-shadow-md leading-relaxed" style={{ color: '#FFFFFF' }}>
                    Every quiz is uniquely generated just for you! Questions are tailored to Class {user?.class || '10'} {subjectDisplayName} curriculum. Get ready for a personalized learning experience! 🎯
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Section - High Contrast */}
            <div className="text-center mb-12">
              <div className="inline-block mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative text-7xl animate-bounce drop-shadow-2xl">🎯</div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-lg leading-tight text-gray-900">
                Choose Your Challenge
              </h2>
              <p className="text-lg md:text-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-700">
                <span>Pick the perfect quiz level for you!</span>
                <span className="text-3xl animate-bounce hidden sm:inline-block">🎮</span>
              </p>
            </div>
            
            {/* Quiz Type Cards - Refined */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {quizTypes.map((quiz, index) => {
                const design = quizTypeDesigns[quiz.id]
                const Icon = quiz.icon
                
                return (
                  <div 
                    key={quiz.id} 
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Enhanced Glow Effect */}
                    <div className={`absolute -inset-2 ${design.gradient} rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 ${design.shadow}`}></div>
                    
                    {/* Card */}
                    <div className="relative glass-panel rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:-rotate-1 glow-effect">
                      {/* Header with Enhanced Gradient */}
                      <div className={`${design.gradient} p-6 relative overflow-hidden opacity-90`}>
                        <div className="absolute top-0 right-0 text-8xl opacity-10 transform rotate-12 animate-pulse">
                          {design.icon}
                        </div>
                        <div className="relative flex items-center justify-between">
                          <div>
                            <div className="text-5xl mb-2 drop-shadow-2xl animate-bounce">{design.icon}</div>
                            <h3 className="text-2xl font-black mb-1 text-white drop-shadow-lg">
                              {quiz.name}
                            </h3>
                            <p className="text-white font-bold text-base drop-shadow-md">{design.pattern}</p>
                          </div>
                          <div className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-white/50 shadow-xl">
                            <div className="text-white font-black text-sm drop-shadow-lg">{quiz.difficulty.toUpperCase()}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Body - High Contrast */}
                      <div className="p-6 bg-white">
                        <p className="font-bold text-base mb-6 text-center" style={{ color: '#000000' }}>{quiz.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border-3 border-blue-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                              <Target className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-black" style={{ color: '#000000' }}>Questions</span>
                            </div>
                            <div className="text-3xl font-black text-center" style={{ color: '#000000' }}>{quiz.questions}</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4 border-3 border-purple-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                              <Clock className="h-5 w-5 text-purple-600" />
                              <span className="text-sm font-black" style={{ color: '#000000' }}>Time</span>
                            </div>
                            <div className="text-3xl font-black text-center" style={{ color: '#000000' }}>{quiz.time}</div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => startQuiz(quiz.id)}
                          className={`w-full py-4 px-6 ${design.gradient} text-white rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3 group border-4 border-white relative overflow-hidden`}
                        >
                          {/* Shine effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          <Rocket className="h-6 w-6 group-hover:animate-bounce text-white relative z-10" />
                          <span className="text-white drop-shadow-lg relative z-10">Start Quiz!</span>
                          <Sparkles className="h-6 w-6 text-white animate-pulse relative z-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Generating Questions Screen
  if (quizState === 'generating') {
    const subjectDisplayName = selectedSubject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    return (
      <div className="min-h-screen bg-[#e0e5ec] perspective-container flex items-center justify-center relative overflow-hidden">
        {/* 3D Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="relative text-center max-w-2xl mx-auto px-6 z-10">
          {/* Main Card */}
          <div className="glass-panel glow-effect rounded-3xl shadow-2xl p-12 border border-white/40">
            {/* Animated Robot Icon */}
            <div className="mb-8 relative">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-white to-purple-50 p-10 rounded-full shadow-2xl border-4 border-purple-300">
                  <div className="text-8xl animate-bounce">🤖</div>
                </div>
              </div>
            </div>
            
            {/* Animated Loading Rings */}
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-8 border-purple-200 rounded-full"></div>
                {/* Spinning Ring 1 */}
                <div className="absolute inset-0 border-8 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin"></div>
                {/* Spinning Ring 2 */}
                <div className="absolute inset-2 border-8 border-transparent border-t-pink-500 border-r-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-purple-600 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Creating Your Quiz
              </span>
            </h2>
            
            {/* Subject Badge */}
            <div className="inline-flex items-center space-x-3 bg-white px-8 py-4 rounded-full shadow-xl mb-6 border-4 border-purple-300">
              <Brain className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-black text-gray-900">{subjectDisplayName}</span>
              <Star className="h-6 w-6 fill-current text-yellow-500" />
            </div>
            
            {/* Description */}
            <p className="text-gray-900 text-xl font-bold mb-6">
              Our AI is crafting personalized questions just for you! 🎨
            </p>
            
            {/* Animated Progress Dots */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="flex space-x-2">
                <span className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
            
            {/* Fun Facts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-300">
                <div className="text-3xl mb-2">✨</div>
                <p className="text-sm font-bold text-black">Unique Questions</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-300">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm font-bold text-black">Curriculum Aligned</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-300">
                <div className="text-3xl mb-2">🚀</div>
                <p className="text-sm font-bold text-black">AI Powered</p>
              </div>
            </div>
            
            {/* Tip Box */}
            <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-4 border-yellow-400 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <div className="text-4xl animate-pulse">💡</div>
                <div className="text-left">
                  <p className="text-sm font-black text-black mb-1">Pro Tip!</p>
                  <p className="text-sm font-bold text-black">Every quiz is completely unique and tailored to your level!</p>
                </div>
              </div>
            </div>
            
            {generationError && (
              <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-4 border-red-300 rounded-2xl shadow-xl">
                <div className="text-5xl mb-3 animate-bounce">😕</div>
                <p className="font-black text-xl text-black mb-2">Oops! Something went wrong</p>
                <p className="text-sm font-semibold text-black mb-4">{generationError}</p>
                <button
                  onClick={() => setQuizState('quiz-selection')}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-black text-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Active Quiz Screen
  if (quizState === 'active') {
    const question = questions[currentQuestion]
    const subjectDisplayName = selectedSubject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    if (!question) {
      return <div>Loading...</div>
    }
    
    const progressPercent = Math.round(((currentQuestion + 1) / questions.length) * 100)
    const optionLabels = ['A', 'B', 'C', 'D']
    const optionColors = [
      { gradient: 'opt-grad-blue', ring: 'ring-blue-custom' },
      { gradient: 'opt-grad-green', ring: 'ring-green-custom' },
      { gradient: 'opt-grad-orange', ring: 'ring-orange-custom' },
      { gradient: 'opt-grad-purple', ring: 'ring-purple-custom' }
    ]
    
    const encouragementMessages = [
      { text: "You're crushing it!", emoji: "🌟" },
      { text: "Keep going strong!", emoji: "💪" },
      { text: "Awesome progress!", emoji: "🎉" },
      { text: "You're a superstar!", emoji: "⭐" },
      { text: "Amazing work!", emoji: "🚀" },
      { text: "You've got this!", emoji: "🔥" }
    ]
    const randomEncouragement = encouragementMessages[currentQuestion % encouragementMessages.length]
    
    return (
      <div className="min-h-screen bg-[#e0e5ec] perspective-container relative overflow-hidden">
        {/* 3D Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <header className="relative bg-white/90 backdrop-blur-xl shadow-2xl border-b-4 border-gradient-to-r from-purple-500 to-pink-500">
          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (window.confirm('🤔 Exit quiz? Your progress will be lost!')) {
                      setQuizState('quiz-selection')
                      setQuestions([])
                      setAnswers({})
                      setCurrentQuestion(0)
                    }
                  }}
                  className="group flex items-center justify-center w-12 h-12 quiz-grad-gray rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110"
                  title="Exit Quiz"
                >
                  <ArrowLeft className="h-6 w-6" style={{ stroke: '#FFFFFF', fill: 'none' }} />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 quiz-grad-yellow rounded-2xl blur opacity-75 animate-pulse"></div>
                    <div className="relative quiz-grad-yellow p-3 rounded-2xl shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-grad-purple">
                      {subjectDisplayName}
                    </h1>
                    <p className="text-sm font-bold text-gray-600 flex items-center space-x-2">
                      <span>Question {currentQuestion + 1}/{questions.length}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span>{randomEncouragement.emoji}</span>
                        <span>{randomEncouragement.text}</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 quiz-grad-chall px-6 py-3 rounded-2xl border-4 border-white shadow-2xl">
                <Clock className="h-6 w-6 text-white animate-pulse" />
                <span className="font-mono text-2xl font-black text-white">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative container mx-auto px-6 py-10">
          <div className="max-w-4xl mx-auto z-10 relative">
            {/* Progress Section */}
            <div className="glass-panel p-8 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-7 w-7 text-purple-600" />
                  <span className="text-xl font-black text-gray-800">Your Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {progressPercent}%
                  </span>
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <div className="relative w-full bg-black/5 rounded-full h-8 overflow-hidden shadow-inner border border-white/20">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-700 flex items-center justify-end pr-3 shadow-lg"
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent > 15 && (
                    <span className="text-white text-sm font-black flex items-center space-x-1">
                      <Rocket className="h-4 w-4 text-white" />
                      <span>{progressPercent}%</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-3 text-sm font-bold text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>🏁</span>
                  <span>Start</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>Finish</span>
                  <span>🏆</span>
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-panel glow-effect overflow-hidden mb-8 border border-white/40">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-9xl opacity-10 transform rotate-12">🤔</div>
                <div className="relative flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border-2 border-white/30">
                      <Brain className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white">Question {currentQuestion + 1}</span>
                  </div>
                  <div className="text-5xl animate-bounce">💭</div>
                </div>
              </div>
              
              {/* Question Body */}
              <div className="p-10">
                <h2 className="text-3xl font-black mb-10 text-black leading-relaxed">
                  {question.question}
                </h2>
                
                {/* Options */}
                <div className="space-y-5">
                  {question.options.map((option, index) => {
                    const isSelected = answers[question.id] === index
                    const colorScheme = optionColors[index]
                    
                    return (
                      <button
                        key={index}
                        onClick={() => selectAnswer(question.id, index)}
                        className={`group relative w-full p-6 text-left rounded-2xl transition-all duration-300 transform ${
                          isSelected
                            ? `${colorScheme.gradient} text-white shadow-2xl scale-105 border-4 border-white ${colorScheme.ring}`
                            : `border-4 border-gray-300 bg-white hover:border-purple-400 hover:shadow-xl hover:scale-102`
                        }`}
                      >
                        <div className="flex items-center space-x-5">
                          {/* Option Label */}
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black transition-all shadow-lg ${
                            isSelected 
                              ? 'bg-white/30 text-white border-2 border-white/50 scale-110' 
                              : `${colorScheme.gradient} text-white group-hover:scale-110`
                          }`}>
                            {isSelected ? '✓' : optionLabels[index]}
                          </div>
                          
                          {/* Option Text */}
                          <span className={`text-xl font-bold flex-1 ${
                            isSelected ? 'text-white' : 'text-black'
                          }`}>
                            {option}
                          </span>
                          
                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-8 w-8 text-white animate-bounce" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-6">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-3 px-8 py-4 bg-white border-4 border-gray-300 rounded-2xl font-black text-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ color: '#000000' }}
              >
                <ArrowLeft className="h-6 w-6" style={{ stroke: '#000000', fill: 'none' }} />
                <span>Previous</span>
              </button>
              
              <div className="flex-1 text-center">
                {answers[question.id] !== undefined ? (
                  <div className="inline-flex items-center space-x-3 bg-green-100 px-8 py-4 rounded-2xl border-4 border-green-400 shadow-2xl animate-bounce">
                    <CheckCircle className="h-7 w-7 text-green-700" />
                    <span className="font-black text-xl text-black">Answer Selected!</span>
                    <Heart className="h-7 w-7 fill-current text-red-500" />
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-8 py-4 rounded-2xl border-4 border-orange-300 shadow-lg">
                    <Lightbulb className="h-6 w-6" />
                    <span className="font-bold text-lg text-black">Choose an answer to continue</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={nextQuestion}
                disabled={answers[question.id] === undefined}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-2xl font-black text-xl hover:from-purple-600 hover:via-pink-600 hover:to-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                <span className="text-white">{currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}</span>
                {currentQuestion === questions.length - 1 ? (
                  <Trophy className="h-7 w-7 text-white" />
                ) : (
                  <Zap className="h-7 w-7 text-white" />
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Quiz Completed Screen
  if (quizState === 'completed') {
    const subjectDisplayName = selectedSubject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const correctCount = questions.filter(q => answers[q.id] === q.correct).length
    const incorrectCount = questions.filter(q => answers[q.id] !== q.correct && answers[q.id] !== undefined).length
    const skippedCount = questions.filter(q => answers[q.id] === undefined).length
    
    // Celebration messages based on score
    const getCelebration = () => {
      if (score >= 90) return { 
        emoji: '🏆', 
        title: 'OUTSTANDING!', 
        message: 'You are a true champion!', 
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        confetti: '🎊�✨�🌟⭐'
      }
      if (score >= 80) return { 
        emoji: '🌟', 
        title: 'EXCELLENT!', 
        message: 'Amazing performance!', 
        gradient: 'from-green-400 via-emerald-500 to-teal-500',
        confetti: '🎉✨⭐🌟💫'
      }
      if (score >= 70) return { 
        emoji: '🎉', 
        title: 'GREAT JOB!', 
        message: 'You did really well!', 
        gradient: 'from-blue-400 via-indigo-500 to-purple-500',
        confetti: '��🎊✨💫⭐'
      }
      if (score >= 60) return { 
        emoji: '👍', 
        title: 'GOOD WORK!', 
        message: 'Keep practicing!', 
        gradient: 'from-purple-400 via-pink-500 to-rose-500',
        confetti: '👏✨💪🌟'
      }
      return { 
        emoji: '💪', 
        title: 'KEEP GOING!', 
        message: 'Practice makes perfect!', 
        gradient: 'from-orange-400 via-red-500 to-pink-500',
        confetti: '💪🔥✨💫'
      }
    }
    
    const celebration = getCelebration()
    
    return (
      <div className="min-h-screen bg-[#e0e5ec] perspective-container relative overflow-hidden">
        {/* 3D Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <header className="relative bg-white/90 backdrop-blur-xl shadow-2xl border-b-4 border-gradient-to-r from-yellow-500 to-orange-500">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl shadow-lg">
                    <Trophy className="h-10 w-10 text-white animate-bounce" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center space-x-3">
                    <span>🎊</span>
                    <span>Quiz Complete!</span>
                    <span>🎊</span>
                  </h1>
                  <p className="text-lg font-bold text-gray-600">{subjectDisplayName} • Class {user?.class || '10'}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="group flex items-center justify-center w-14 h-14 quiz-grad-comp rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110"
              >
                <Home className="h-7 w-7" style={{ stroke: '#FFFFFF', fill: 'none' }} />
              </Link>
            </div>
          </div>
        </header>

        <main className="relative container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Celebration Banner */}
            <div className={`relative bg-gradient-to-r ${celebration.gradient} rounded-3xl p-12 mb-10 text-white text-center shadow-2xl overflow-hidden transform hover:scale-105 transition-all`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              
              {/* Floating Confetti */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {celebration.confetti.split('').map((emoji, i) => (
                  <div
                    key={i}
                    className="absolute text-4xl animate-bounce"
                    style={{
                      left: `${(i + 1) * 15}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${2 + Math.random()}s`
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              
              <div className="relative">
                <div className="text-9xl mb-6 animate-bounce inline-block">{celebration.emoji}</div>
                <h2 className="text-6xl font-black mb-4 drop-shadow-2xl">{celebration.title}</h2>
                <p className="text-3xl font-bold drop-shadow-lg">{celebration.message}</p>
              </div>
            </div>

            {/* Score Display Card */}
            <div className="glass-panel glow-effect p-10 mb-10">
              <div className="text-center mb-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                  <div className={`relative w-48 h-48 rounded-full mx-auto flex flex-col items-center justify-center shadow-2xl border-8 border-white ${
                    score >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                    score >= 60 ? 'bg-gradient-to-br from-yellow-400 to-orange-600' :
                    'bg-gradient-to-br from-red-400 to-pink-600'
                  }`}>
                    <div className="text-7xl font-black text-white drop-shadow-lg">{score}%</div>
                    <div className="text-white font-bold text-lg">Score</div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-black text-black mb-3">
                  Your Performance
                </h3>
                <p className="text-xl text-black font-bold">
                  You answered {correctCount} out of {questions.length} questions correctly! 🎯
                </p>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-4 border-green-300 shadow-xl transform hover:scale-105 transition-all">
                  <div className="absolute top-0 right-0 text-9xl opacity-10">✅</div>
                  <div className="relative text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <div className="text-5xl font-black text-green-700 mb-2">
                      {correctCount}
                    </div>
                    <div className="text-lg font-black text-black">Correct Answers</div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border-4 border-red-300 shadow-xl transform hover:scale-105 transition-all">
                  <div className="absolute top-0 right-0 text-9xl opacity-10">❌</div>
                  <div className="relative text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <div className="text-5xl font-black text-red-700 mb-2">
                      {incorrectCount}
                    </div>
                    <div className="text-lg font-black text-black">Incorrect</div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border-4 border-gray-300 shadow-xl transform hover:scale-105 transition-all">
                  <div className="absolute top-0 right-0 text-9xl opacity-10">⏭️</div>
                  <div className="relative text-center">
                    <div className="text-6xl mb-4">⏭️</div>
                    <div className="text-5xl font-black text-gray-700 mb-2">
                      {skippedCount}
                    </div>
                    <div className="text-lg font-black text-black">Skipped</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Explanations Section */}
            <div className="glass-panel p-10 mb-10">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <Lightbulb className="h-10 w-10 text-yellow-500 animate-pulse" />
                <h3 className="text-4xl font-black text-black">
                  {selectedSubject === 'mathematics' ? '📐 Step-by-Step Solutions' : '📚 Answer Explanations'}
                </h3>
                <Lightbulb className="h-10 w-10 text-yellow-500 animate-pulse" />
              </div>
              
              <div className="space-y-6">
                {questions.map((q, index) => {
                  const userAnswer = answers[q.id]
                  const isCorrect = userAnswer === q.correct
                  const wasSkipped = userAnswer === undefined
                  
                  return (
                    <div 
                      key={q.id} 
                      className={`rounded-2xl p-6 border-4 ${
                        isCorrect ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400' :
                        wasSkipped ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-400' :
                        'bg-gradient-to-br from-red-50 to-pink-50 border-red-400'
                      } shadow-lg`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black ${
                          isCorrect ? 'bg-green-500 text-white' :
                          wasSkipped ? 'bg-gray-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {isCorrect && <CheckCircle className="h-6 w-6 text-green-600" />}
                            {!isCorrect && !wasSkipped && <XCircle className="h-6 w-6 text-red-600" />}
                            {wasSkipped && <span className="text-2xl">⏭️</span>}
                            <span className={`text-lg font-black ${
                              isCorrect ? 'text-green-700' :
                              wasSkipped ? 'text-gray-700' :
                              'text-red-700'
                            }`}>
                              {isCorrect ? 'Correct!' : wasSkipped ? 'Skipped' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-black mb-4">{q.question}</p>
                          
                          {/* Options Display */}
                          <div className="space-y-2 mb-4">
                            {q.options.map((option, optIndex) => {
                              const isUserAnswer = userAnswer === optIndex
                              const isCorrectAnswer = q.correct === optIndex
                              const optionLabel = ['A', 'B', 'C', 'D'][optIndex]
                              
                              return (
                                <div 
                                  key={optIndex}
                                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 ${
                                    isCorrectAnswer ? 'bg-green-100 border-green-500 font-bold' :
                                    isUserAnswer && !isCorrect ? 'bg-red-100 border-red-500 font-bold' :
                                    'bg-white border-gray-300'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black ${
                                    isCorrectAnswer ? 'bg-green-500 text-white' :
                                    isUserAnswer && !isCorrect ? 'bg-red-500 text-white' :
                                    'bg-gray-200 text-black'
                                  }`}>
                                    {optionLabel}
                                  </span>
                                  <span className="text-black font-semibold">{option}</span>
                                  {isCorrectAnswer && <span className="ml-auto text-green-600 font-black">✓ Correct Answer</span>}
                                  {isUserAnswer && !isCorrect && <span className="ml-auto text-red-600 font-black">✗ Your Answer</span>}
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Detailed Explanation */}
                          {q.explanation && (
                            <div className="bg-white/80 rounded-xl p-5 border-2 border-blue-300 shadow-inner">
                              <div className="flex items-center space-x-2 mb-3">
                                <Lightbulb className="h-6 w-6 text-yellow-500" />
                                <h4 className="text-xl font-black text-black">
                                  {selectedSubject === 'mathematics' ? 'Solution:' : 'Explanation:'}
                                </h4>
                              </div>
                              <div className="text-black font-medium whitespace-pre-line leading-relaxed">
                                {q.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setQuizState('quiz-selection')
                  setQuestions([])
                  setAnswers({})
                  setCurrentQuestion(0)
                  setScore(0)
                }}
                className="group relative overflow-hidden py-6 px-8 quiz-grad-comp text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <Zap className="h-7 w-7" />
                  <span>Take Another Quiz</span>
                  <Rocket className="h-7 w-7" />
                </div>
              </button>
              
              <button
                onClick={() => {
                  setQuizState('subject-selection')
                  setSelectedSubject('')
                  setQuestions([])
                  setAnswers({})
                  setCurrentQuestion(0)
                  setScore(0)
                }}
                className="group relative overflow-hidden py-6 px-8 quiz-grad-standard text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <BookOpen className="h-7 w-7" />
                  <span>Change Subject</span>
                  <Star className="h-7 w-7 fill-current" />
                </div>
              </button>
              
              <Link 
                to="/quiz-history" 
                className="group relative overflow-hidden py-6 px-8 quiz-grad-chall text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-center"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <TrendingUp className="h-7 w-7" />
                  <span>View History</span>
                  <Clock className="h-7 w-7" />
                </div>
              </Link>
              
              <Link 
                to="/ai-assistant" 
                className="group relative overflow-hidden py-6 px-8 quiz-grad-quick text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-center"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <Brain className="h-7 w-7" />
                  <span>AI Assistant</span>
                  <Sparkles className="h-7 w-7" />
                </div>
              </Link>
            </div>

            {/* Back to Dashboard Link */}
            <div className="mt-6">
              <Link 
                to="/dashboard" 
                className="block w-full py-6 px-8 bg-white border-4 border-gray-300 text-black rounded-2xl font-black text-xl shadow-lg hover:shadow-2xl transition-all hover:border-purple-400 text-center transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Home className="h-7 w-7" style={{ stroke: '#000000', fill: 'none' }} />
                  <span>Back to Dashboard</span>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default Quiz
