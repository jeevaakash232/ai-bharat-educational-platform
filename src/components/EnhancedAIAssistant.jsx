import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNetwork } from '../contexts/NetworkContext'
import { ArrowLeft, Send, Mic, BookOpen, Loader, StickyNote, Clock, Database } from 'lucide-react'
import { getBedrockResponse } from '../services/bedrockService'
import SubjectHelper from './SubjectHelper'
import { VoiceRecognitionService } from '../services/voiceService'
import NotesPanel from './NotesPanel'
import { historyService } from '../services/historyService'

// NEW IMPORTS - Feature 1 & 2
import { VoiceEmotionAnalyzer } from '../services/voiceEmotionAnalyzer'
import VoiceAnalyticsIndicator from './VoiceAnalyticsIndicator'
import { getOfflineAI } from '../services/offlineAILite'
import { storeDoubtOffline } from '../services/offlineDoubtStorage'
import OfflineDoubtsPanel from './OfflineDoubtsPanel'
import { API_BASE_URL } from '../config'

const EnhancedAIAssistant = () => {
  const { user } = useAuth()
  const { networkStatus, pendingDoubtsCount, refreshPendingCount, isOnline, isOffline } = useNetwork()
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputMode, setInputMode] = useState('text')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const [showNotes, setShowNotes] = useState(false)
  const fileInputRef = useRef(null)
  const voiceRecognition = useRef(null)
  const conversationIdRef = useRef(`conv-${Date.now()}`)

  // NEW STATE - Feature 1: Voice Emotion Analysis
  const [voiceAnalyzer, setVoiceAnalyzer] = useState(null)
  const [voiceAnalytics, setVoiceAnalytics] = useState(null)
  const [showVoiceAnalytics, setShowVoiceAnalytics] = useState(false)

  // NEW STATE - Feature 2: Offline Mode (using context)
  const [offlineAI] = useState(() => getOfflineAI())
  const [showOfflinePanel, setShowOfflinePanel] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Initialize voice recognition service
    voiceRecognition.current = new VoiceRecognitionService()

    // Cleanup on unmount
    return () => {
      if (voiceRecognition.current && voiceRecognition.current.isCurrentlyListening()) {
        voiceRecognition.current.stopListening()
      }
    }
  }, [user, navigate])

  useEffect(() => {
    // Set initial message after user is loaded
    if (user && messages.length === 0) {
      const initialMessage = {
        id: 1,
        type: 'ai',
        content: `**Hello ${user.name}! 👋**

I'm your AI learning assistant with **emotion-aware tutoring** and **multilingual support**!

${user.subjects ? `**📚 Your Subjects:** ${user.subjects.join(', ')}` : ''}

**🎯 New Features:**

**🎭 Emotion-Aware Tutoring:**
• Voice analysis detects your emotional state
• AI adapts responses based on your confidence
• Personalized learning experience

**🌐 Multilingual Support:**
• Ask in Tamil, Hindi, Telugu, or any Indian language
• Get responses in the SAME language
• Natural language understanding

**📡 Offline AI Lite Mode:**
• Works even without internet
• Questions saved and synced automatically
• Basic help available offline

**💡 Try voice input** to experience emotion-aware tutoring in your language!

How can I help you learn today?`
      }
      setMessages([initialMessage])
    }
  }, [user, messages.length])

  if (!user) {
    return null
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsLoading(true)

    try {
      // NEW: Check network status
      if (isOffline) {
        // Use offline AI
        const offlineResponse = offlineAI.getResponse(currentInput)
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: offlineResponse.response,
          isOffline: true
        }
        setMessages(prev => [...prev, aiMessage])

        // Store doubt for later sync
        await storeDoubtOffline({
          question: currentInput,
          subject: 'General',
          userContext: {
            name: user?.name,
            class: user?.class,
            board: user?.board
          },
          offlineResponse: offlineResponse.response
        })
        
        await refreshPendingCount()
        setIsLoading(false)
        return
      }

      // Online mode - use full AI
      console.log('🚀 Sending message to AWS Bedrock:', currentInput)
      
      const response = await getBedrockResponse(currentInput, {
        name: user?.name,
        class: user?.class,
        board: user?.board,
        subjects: user?.subjects
      })
      
      console.log('🤖 AWS Bedrock Response received')
      
      if (!response) {
        throw new Error('Empty AI response')
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response
      }
      
      setMessages(prev => [...prev, aiMessage])

      // Track AI conversation
      try {
        historyService.setUser(user.email || user.id)
        await historyService.trackAIConversation({
          sessionId: conversationIdRef.current,
          subject: 'General',
          messages: [
            { role: 'user', content: currentInput, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response, timestamp: new Date().toISOString() }
          ],
          startTime: new Date().toISOString(),
          duration: 0
        })
      } catch (error) {
        console.error('Error tracking AI conversation:', error)
      }
    } catch (error) {
      console.error('❌ AWS Bedrock Error:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `🔧 **Error**\n\n${error.message}\n\nPlease try again or rephrase your question.`
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuestionSelect = (question) => {
    setInputText(question)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // NEW: Enhanced voice recording with emotion analysis
  const startVoiceRecording = async () => {
    if (!voiceRecognition.current || !voiceRecognition.current.supported) {
      setVoiceError('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // NEW: Start emotion analysis
    if (VoiceEmotionAnalyzer.isSupported()) {
      const analyzer = new VoiceEmotionAnalyzer()
      const started = await analyzer.startAnalysis()
      if (started) {
        setVoiceAnalyzer(analyzer)
        setShowVoiceAnalytics(true)
      }
    }

    setVoiceError(null)
    setIsRecording(true)

    // Determine language
    let languageCode = 'en-IN'
    if (user.mediumName) {
      const mediumLower = user.mediumName.toLowerCase()
      if (mediumLower.includes('tamil')) languageCode = 'ta-IN'
      else if (mediumLower.includes('hindi')) languageCode = 'hi-IN'
      else if (mediumLower.includes('telugu')) languageCode = 'te-IN'
      else if (mediumLower.includes('kannada')) languageCode = 'kn-IN'
      else if (mediumLower.includes('malayalam')) languageCode = 'ml-IN'
      else if (mediumLower.includes('bengali')) languageCode = 'bn-IN'
      else if (mediumLower.includes('marathi')) languageCode = 'mr-IN'
      else if (mediumLower.includes('gujarati')) languageCode = 'gu-IN'
      else if (mediumLower.includes('punjabi')) languageCode = 'pa-IN'
    }

    voiceRecognition.current.startListening(
      languageCode,
      async (transcript, confidence) => {
        setIsRecording(false)
        
        // NEW: Stop emotion analysis and get results
        let analytics = null
        if (voiceAnalyzer) {
          analytics = voiceAnalyzer.stopAnalysis()
          setVoiceAnalytics(analytics)
          setVoiceAnalyzer(null)
        }
        
        console.log('🎤 Voice recognized:', transcript)
        if (analytics) {
          console.log('🎭 Emotion analysis:', analytics)
        }
        
        setInputText(transcript)
        
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: transcript,
          voiceAnalytics: analytics
        }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
          let response

          // NEW: Check network status
          if (isOffline) {
            // Offline mode
            const offlineResponse = offlineAI.getResponse(transcript)
            response = offlineResponse.response
            
            // Store with emotion data
            await storeDoubtOffline({
              question: transcript,
              subject: 'General',
              userContext: {
                name: user?.name,
                class: user?.class
              },
              emotion: analytics?.emotion,
              confidence: analytics?.confidence,
              offlineResponse: response
            })
            
            await refreshPendingCount()
          } else if (analytics && isOnline) {
            // NEW: Use emotion-aware endpoint
            const emotionResponse = await fetch(`${API_BASE_URL}/api/emotion-aware/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: transcript,
                emotion: analytics.emotion,
                confidence: analytics.confidence,
                userContext: {
                  name: user?.name,
                  class: user?.class,
                  board: user?.board,
                  subjects: user?.subjects
                }
              })
            })

            if (!emotionResponse.ok) throw new Error('Emotion-aware API failed')
            
            const data = await emotionResponse.json()
            response = data.response
          } else {
            // Regular online mode
            response = await getBedrockResponse(transcript, {
              name: user?.name,
              class: user?.class,
              board: user?.board,
              subjects: user?.subjects
            })
          }
          
          const aiMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: response,
            isOffline: isOffline
          }
          setMessages(prev => [...prev, aiMessage])
          
          // Hide analytics after a delay
          setTimeout(() => setShowVoiceAnalytics(false), 5000)
        } catch (error) {
          console.error('❌ Error:', error)
          const errorMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: `Sorry, I encountered an error: ${error.message}`
          }
          setMessages(prev => [...prev, errorMessage])
        }
        setIsLoading(false)
      },
      (error) => {
        setIsRecording(false)
        setShowVoiceAnalytics(false)
        if (voiceAnalyzer) {
          voiceAnalyzer.stopAnalysis()
          setVoiceAnalyzer(null)
        }
        
        let errorMsg = '⚠️ Voice recognition error. '
        
        if (error === 'not-allowed' || error === 'permission-denied') {
          errorMsg += 'Please allow microphone access in your browser. Click the 🔒 icon in the address bar and select "Allow" for microphone.'
        } else if (error === 'no-speech') {
          errorMsg += 'No speech detected. Please speak louder and closer to the microphone, then try again.'
        } else if (error === 'audio-capture') {
          errorMsg += 'Microphone not available. Please check if your microphone is connected and not being used by another application.'
        } else if (error === 'network') {
          errorMsg += 'Speech recognition service unavailable. Please check your internet connection and try again.'
        } else if (error === 'not-supported') {
          errorMsg += 'Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge for voice features.'
        } else {
          errorMsg += `Please try again or use text input instead. (Error: ${error})`
        }
        
        setVoiceError(errorMsg)
        
        console.error('🎤 Voice recognition error:', error)
        console.log('💡 Tip: Check VOICE_TROUBLESHOOTING.md for detailed help')
      }
    )
  }

  const stopVoiceRecording = () => {
    if (voiceRecognition.current) {
      voiceRecognition.current.stopListening()
      setIsRecording(false)
    }
    if (voiceAnalyzer) {
      voiceAnalyzer.stopAnalysis()
      setVoiceAnalyzer(null)
    }
    setShowVoiceAnalytics(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NEW: Voice Analytics Indicator */}
      <VoiceAnalyticsIndicator
        emotion={voiceAnalytics?.emotion}
        confidence={voiceAnalytics?.confidence}
        metrics={voiceAnalytics?.metrics}
        isVisible={showVoiceAnalytics}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Enhanced AI Assistant</h1>
                  <p className="text-sm text-gray-600">Emotion-aware • Multilingual • Offline-ready</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {pendingDoubtsCount > 0 && (
                <button
                  onClick={() => setShowOfflinePanel(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                >
                  <Database className="h-5 w-5" />
                  <span className="hidden md:inline">{pendingDoubtsCount} Pending</span>
                </button>
              )}
              <Link
                to="/ai-history"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
              >
                <Clock className="h-5 w-5" />
                <span className="hidden md:inline">History</span>
              </Link>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showNotes 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <StickyNote className="h-5 w-5" />
                <span className="hidden md:inline">Notes</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        <SubjectHelper onQuestionSelect={handleQuestionSelect} />
        
        <div className={`grid ${showNotes ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-300px)] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : message.type === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : message.type === 'system'
                        ? 'bg-green-50 border-2 border-green-200 text-green-800'
                        : message.isOffline
                        ? 'bg-orange-50 border-2 border-orange-200 text-gray-800'
                        : 'bg-white border-2 border-gray-200 text-gray-800'
                    }`}
                  >
                    {message.voiceAnalytics && (
                      <div className="mb-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        🎭 {message.voiceAnalytics.emotion} • {message.voiceAnalytics.confidence}% confidence
                      </div>
                    )}
                    {message.isOffline && (
                      <div className="mb-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        🔴 Offline AI Lite Response
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, index) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <h3 key={index} className="text-lg font-bold text-indigo-700 mt-4 mb-2">
                              {line.replace(/\*\*/g, '')}
                            </h3>
                          )
                        }
                        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                          return (
                            <li key={index} className="ml-4 text-gray-700">
                              {line.replace(/^[•-]\s*/, '')}
                            </li>
                          )
                        }
                        if (line.trim()) {
                          return (
                            <p key={index} className="text-gray-700 leading-relaxed my-2">
                              {line}
                            </p>
                          )
                        }
                        return <br key={index} />
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 text-gray-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-lg">
                    <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="font-semibold">
                      {networkStatus === NETWORK_STATUS.OFFLINE ? 'Offline AI thinking...' : 'AI is thinking...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    inputMode === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setInputMode('voice')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    inputMode === 'voice' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🎭 Voice + Emotion
                </button>
              </div>

              {inputMode === 'text' && (
                <div className="flex space-x-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-indigo-500 bg-white text-black"
                    rows="2"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              )}

              {inputMode === 'voice' && (
                <div className="text-center">
                  {!isRecording ? (
                    <button
                      onClick={startVoiceRecording}
                      disabled={isLoading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 mx-auto"
                    >
                      <Mic className="h-5 w-5" />
                      <span>Start Recording (with Emotion Analysis)</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopVoiceRecording}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2 mx-auto animate-pulse"
                    >
                      <Mic className="h-5 w-5" />
                      <span>🎤 Analyzing voice... (Click to stop)</span>
                    </button>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {isRecording 
                      ? '🎤 Speak now... Analyzing emotion and confidence' 
                      : 'Voice input with real-time emotion detection'
                    }
                  </p>
                  {voiceError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      ⚠️ {voiceError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {showNotes && (
            <div className="h-[calc(100vh-300px)]">
              <NotesPanel
                sourceType="ai-chat"
                sourceId="enhanced-ai-assistant"
                subject="General"
                title="AI Chat Notes"
              />
            </div>
          )}
        </div>
      </div>

      {/* Offline Doubts Panel */}
      <OfflineDoubtsPanel
        isOpen={showOfflinePanel}
        onClose={() => {
          setShowOfflinePanel(false)
          refreshPendingCount()
        }}
      />
    </div>
  )
}

export default EnhancedAIAssistant
