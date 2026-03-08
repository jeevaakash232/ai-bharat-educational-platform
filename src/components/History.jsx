import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { historyService } from '../services/historyService'
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  Trash2,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react'

const History = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [bookHistory, setBookHistory] = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [aiHistory, setAIHistory] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    historyService.setUser(user.email || user.id)
    loadHistory()
  }, [user, navigate])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const [books, quizzes, aiChats, stats] = await Promise.all([
        historyService.getBookHistory(50),
        historyService.getQuizHistory(50),
        historyService.getAIHistory(50),
        historyService.getStatistics()
      ])

      setBookHistory(books)
      setQuizHistory(quizzes)
      setAIHistory(aiChats)
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading history:', error)
    }
    setLoading(false)
  }

  const handleDeleteEntry = async (historyId, type) => {
    if (!confirm('Delete this history entry?')) return

    try {
      await historyService.deleteHistoryEntry(historyId, type)
      loadHistory()
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry')
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Clear all history? This cannot be undone.')) return

    try {
      await historyService.clearHistory()
      loadHistory()
    } catch (error) {
      console.error('Error clearing history:', error)
      alert('Failed to clear history')
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0m'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-800">Learning History</h1>
                  <p className="text-xs md:text-sm text-gray-600">Track your progress</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden md:inline">Clear All</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Books Viewed</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">{statistics.totalBooksViewed}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Quizzes Taken</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">{statistics.totalQuizzesTaken}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">AI Chats</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">{statistics.totalAIConversations}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Avg Quiz Score</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">{statistics.averageQuizScore}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 md:mb-8 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'books'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Books ({bookHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'quizzes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Quizzes ({quizHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            AI Chats ({aiHistory.length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading history...</p>
          </div>
        )}

        {/* History Content */}
        {!loading && (
          <div className="space-y-4">
            {/* All Activity */}
            {activeTab === 'all' && (
              <>
                {[...bookHistory, ...quizHistory, ...aiHistory]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 20)
                  .map((entry) => (
                    <div key={entry.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            entry.type === 'book_view' ? 'bg-blue-100' :
                            entry.type === 'quiz_attempt' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            {entry.type === 'book_view' && <BookOpen className="h-5 w-5 text-blue-600" />}
                            {entry.type === 'quiz_attempt' && <Award className="h-5 w-5 text-green-600" />}
                            {entry.type === 'ai_conversation' && <MessageSquare className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {entry.type === 'book_view' && entry.bookTitle}
                              {entry.type === 'quiz_attempt' && `${entry.subject} Quiz`}
                              {entry.type === 'ai_conversation' && `AI Chat - ${entry.subject}`}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(entry.timestamp)}</span>
                              </span>
                              {entry.duration && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDuration(entry.duration)}</span>
                                </span>
                              )}
                              {entry.type === 'quiz_attempt' && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  entry.percentage >= 80 ? 'bg-green-100 text-green-700' :
                                  entry.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  Score: {entry.percentage}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id, entry.type)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* Books Tab */}
            {activeTab === 'books' && (
              <>
                {bookHistory.map((book) => (
                  <div key={book.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{book.bookTitle}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{book.bookSubject}</span>
                            <span>•</span>
                            <span>Class {book.bookClass}</span>
                            <span>•</span>
                            <span>{formatDate(book.timestamp)}</span>
                            {book.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(book.duration)}</span>
                              </>
                            )}
                            {book.lastPage > 1 && (
                              <>
                                <span>•</span>
                                <span>Page {book.lastPage}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/book-viewer/${book.bookId}`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteEntry(book.id, 'book_view')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <>
                {quizHistory.map((quiz) => (
                  <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{quiz.subject} Quiz</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{formatDate(quiz.timestamp)}</span>
                            <span>•</span>
                            <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              quiz.percentage >= 80 ? 'bg-green-100 text-green-700' :
                              quiz.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {quiz.percentage}%
                            </span>
                            {quiz.timeTaken && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(quiz.timeTaken)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(quiz.id, 'quiz_attempt')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* AI Chats Tab */}
            {activeTab === 'ai' && (
              <>
                {aiHistory.map((chat) => (
                  <div key={chat.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">AI Chat - {chat.subject}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{formatDate(chat.timestamp)}</span>
                            <span>•</span>
                            <span>{chat.messageCount} messages</span>
                            {chat.duration && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(chat.duration)}</span>
                              </>
                            )}
                          </div>
                          {chat.messages && chat.messages.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {chat.messages[0].content}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(chat.id, 'ai_conversation')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Empty State */}
            {((activeTab === 'all' && bookHistory.length === 0 && quizHistory.length === 0 && aiHistory.length === 0) ||
              (activeTab === 'books' && bookHistory.length === 0) ||
              (activeTab === 'quizzes' && quizHistory.length === 0) ||
              (activeTab === 'ai' && aiHistory.length === 0)) && (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No History Yet</h3>
                <p className="text-gray-500">
                  Start learning to see your activity here
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default History
