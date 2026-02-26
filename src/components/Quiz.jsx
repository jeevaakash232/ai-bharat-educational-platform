import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Award, CheckCircle, XCircle } from 'lucide-react'

const Quiz = () => {
  const { subjectName } = useParams()
  const displayName = subjectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const [quizState, setQuizState] = useState('selection') // selection, active, completed
  const [selectedQuizType, setSelectedQuizType] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [score, setScore] = useState(0)

  // Sample quiz data
  const quizTypes = [
    { id: 'chapter-1', name: 'Chapter 1: Introduction to Basics', questions: 10, time: '10 min' },
    { id: 'chapter-2', name: 'Chapter 2: Fundamental Concepts', questions: 15, time: '15 min' },
    { id: 'subject-review', name: 'Subject Review Quiz', questions: 25, time: '25 min' },
    { id: 'practice-test', name: 'Practice Test', questions: 50, time: '50 min' }
  ]

  const sampleQuestions = [
    {
      id: 1,
      question: "What is the fundamental principle behind this concept?",
      options: [
        "Option A: First principle explanation",
        "Option B: Second principle explanation", 
        "Option C: Third principle explanation",
        "Option D: Fourth principle explanation"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "Which of the following best describes the relationship between these elements?",
      options: [
        "Option A: Direct relationship",
        "Option B: Inverse relationship",
        "Option C: No relationship", 
        "Option D: Complex relationship"
      ],
      correct: 1
    },
    {
      id: 3,
      question: "What would be the expected outcome in this scenario?",
      options: [
        "Option A: Positive outcome",
        "Option B: Negative outcome",
        "Option C: Neutral outcome",
        "Option D: Variable outcome"
      ],
      correct: 2
    }
  ]

  // Timer effect
  useEffect(() => {
    if (quizState === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizState === 'active') {
      completeQuiz()
    }
  }, [timeLeft, quizState])

  const startQuiz = (quizType) => {
    setSelectedQuizType(quizType)
    setQuizState('active')
    setCurrentQuestion(0)
    setAnswers({})
    setTimeLeft(600) // Reset timer
  }

  const selectAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz()
    }
  }

  const completeQuiz = () => {
    // Calculate score
    let correctAnswers = 0
    sampleQuestions.forEach(question => {
      if (answers[question.id] === question.correct) {
        correctAnswers++
      }
    })
    setScore(Math.round((correctAnswers / sampleQuestions.length) * 100))
    setQuizState('completed')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Quiz Selection Screen
  if (quizState === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Link to={`/subject/${subjectName}`} className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-yellow-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{displayName} Quiz</h1>
                  <p className="text-sm text-gray-600">Test your knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Quiz</h2>
            
            <div className="space-y-4">
              {quizTypes.map((quiz) => (
                <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{quiz.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{quiz.questions} Questions</span>
                        <span>•</span>
                        <span>{quiz.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => startQuiz(quiz.id)}
                      className="btn btn-primary"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Active Quiz Screen
  if (quizState === 'active') {
    const question = sampleQuestions[currentQuestion]
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Award className="h-8 w-8 text-yellow-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Quiz in Progress</h1>
                  <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {sampleQuestions.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentQuestion + 1) / sampleQuestions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(question.id, index)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                      answers[question.id] === index
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={answers[question.id] === undefined}
                className="btn btn-primary disabled:opacity-50"
              >
                {currentQuestion === sampleQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Quiz Completed Screen
  if (quizState === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Quiz Completed!</h1>
                <p className="text-sm text-gray-600">Great job on finishing the quiz</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Score Display */}
            <div className="card mb-8">
              <div className="text-center">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${
                  score >= 80 ? 'bg-green-100 text-green-600' :
                  score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {score}%
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  You scored {score}% on this quiz
                </p>

                {/* Detailed Results */}
                <div className="grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {sampleQuestions.filter(q => answers[q.id] === q.correct).length}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {sampleQuestions.filter(q => answers[q.id] !== q.correct && answers[q.id] !== undefined).length}
                    </div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {sampleQuestions.filter(q => answers[q.id] === undefined).length}
                    </div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => setQuizState('selection')}
                className="btn btn-primary w-full"
              >
                Take Another Quiz
              </button>
              
              <Link to={`/subject/${subjectName}`} className="btn btn-secondary w-full">
                Back to Subject
              </Link>
              
              <Link to="/ai-assistant" className="btn btn-secondary w-full">
                Get Help from AI Assistant
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default Quiz