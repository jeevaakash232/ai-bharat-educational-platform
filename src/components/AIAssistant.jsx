import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Send, Mic, Image, Youtube, BookOpen, Loader, StickyNote, Clock } from 'lucide-react'
import { getBedrockResponse, getBedrockResponseWithTranslation } from '../services/bedrockService'
import SubjectHelper from './SubjectHelper'
import { VoiceRecognitionService, getLanguageCode } from '../services/voiceService'
import NotesPanel from './NotesPanel'
import { historyService } from '../services/historyService'
import { useBilingualAI } from '../hooks/useBilingualAI'
import BilingualMessage from './BilingualMessage'

const AIAssistant = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getBilingual, userLanguage } = useBilingualAI()
  
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

I'm your AI learning assistant powered by AWS Bedrock (Claude AI). I provide **step-by-step explanations** for all your Class ${user.class || ''} subjects.

${user.subjects ? `**📚 Your Subjects:** ${user.subjects.join(', ')}` : ''}

**🎯 What I Can Help With:**

**For Mathematics:** 📐
• Complete step-by-step solutions
• All working steps shown clearly
• Formulas and key concepts explained
• Common mistakes highlighted
• Perfect for exam preparation

**For Science:** 🔬
• Clear concept explanations
• Real-world examples
• Diagrams and illustrations described
• Complex topics simplified

**For Languages:** 📖
• Grammar rules explained
• Literature analysis
• Writing assistance
• Comprehension help

**For All Subjects:**
• Homework help
• Exam preparation
• Concept clarification
• Practice problems

**⚠️ Important:** I only answer questions related to your educational subjects. I cannot help with personal advice, current events, entertainment, or non-educational topics.

**💡 Try asking:**
• "Solve: 2x + 5 = 15 (show all steps)"
• "Explain photosynthesis in simple terms"
• "What is Newton's Second Law?"
• "Help me understand this grammar rule"

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
      console.log('🚀 Sending message to AWS Bedrock:', currentInput)
      console.log('👤 User context:', user)
      
      // Use translation-aware endpoint since user may type in regional language
      const { response } = await getBedrockResponseWithTranslation(
        currentInput,
        user?.email || user?.id || 'anonymous'
      )

      if (!response) throw new Error('Empty AI response')
      
      // Get bilingual version of the response
      const bilingualResponse = await getBilingual(response)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        bilingual: bilingualResponse
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
        console.log('💬 AI conversation tracked')
      } catch (error) {
        console.error('Error tracking AI conversation:', error)
      }
    } catch (error) {
      console.error('❌ AWS Bedrock Error:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `🔧 **AWS Bedrock Error**

**Error**: ${error.message}

Please try again or rephrase your question.`
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // For demo purposes, just show that image was uploaded
      const imageMessage = {
        id: Date.now(),
        type: 'user',
        content: `[Image uploaded: ${file.name}]`
      }
      setMessages(prev => [...prev, imageMessage])
      
      // Simulate AI response to image
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I can see your image! Please describe what you need help with regarding this image, and I\'ll do my best to assist you.'
        }
        setMessages(prev => [...prev, aiMessage])
      }, 1000)
    }
  }

  const handleYouTubeUrl = () => {
    const url = prompt('Enter YouTube URL:')
    if (url) {
      const urlMessage = {
        id: Date.now(),
        type: 'user',
        content: `[YouTube URL: ${url}]`
      }
      setMessages(prev => [...prev, urlMessage])
      
      // Simulate AI response to YouTube URL
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I\'ve received your YouTube URL. I can help you understand the content, create notes, or answer questions about the video. What would you like me to help you with?'
        }
        setMessages(prev => [...prev, aiMessage])
      }, 1000)
    }
  }

  const handleQuestionSelect = (question) => {
    setInputText(question)
    // Auto-send the question
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const startVoiceRecording = () => {
    if (!voiceRecognition.current || !voiceRecognition.current.supported) {
      setVoiceError('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    setVoiceError(null)
    setIsRecording(true)

    // Determine language based on user's medium using the voice service helper
    const userLanguage = user.mediumName ? user.mediumName.replace(' Medium', '') : 'English'
    const languageCode = getLanguageCode(userLanguage)
    
    console.log('🎤 Starting voice recognition for:', userLanguage, '→', languageCode)

    voiceRecognition.current.startListening(
      languageCode,
      // On success
      async (transcript, confidence) => {
        setIsRecording(false)
        console.log('🎤 Voice recognized:', transcript, `(${Math.round(confidence * 100)}% confidence)`)
        
        // Set the transcript as input text
        setInputText(transcript)
        
        // Auto-send the message
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: transcript
        }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
          // Get response from AWS Bedrock
          const { response } = await getBedrockResponseWithTranslation(
            transcript,
            user?.email || user?.id || 'anonymous'
          )
          
          const aiMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: response
          }
          setMessages(prev => [...prev, aiMessage])
        } catch (error) {
          console.error('❌ AWS Bedrock Error:', error)
          const errorMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: `Sorry, I encountered an error: ${error.message}`
          }
          setMessages(prev => [...prev, errorMessage])
        }
        setIsLoading(false)
      },
      // On error
      (error) => {
        setIsRecording(false)
        console.error('🎤 Voice recognition error:', error)
        
        let errorMsg = 'Voice recognition error. '
        if (error === 'not-allowed') {
          errorMsg += 'Please allow microphone access in your browser settings.'
        } else if (error === 'no-speech') {
          errorMsg += 'No speech detected. Please try again.'
        } else if (error === 'audio-capture') {
          errorMsg += 'Microphone not available.'
        } else {
          errorMsg += 'Please try again or use text input.'
        }
        setVoiceError(errorMsg)
      }
    )
  }

  const stopVoiceRecording = () => {
    if (voiceRecognition.current) {
      voiceRecognition.current.stopListening()
      setIsRecording(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
                  <p className="text-sm text-gray-600">Your personal learning companion</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/ai-history"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
                title="View AI Chat History"
              >
                <Clock className="h-5 w-5" />
                <span className="hidden md:inline">AI History</span>
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
        {/* Subject Helper */}
        <SubjectHelper onQuestionSelect={handleQuestionSelect} />
        
        <div className={`grid ${showNotes ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-300px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-800'
                  }`}
                >
                  {message.type === 'ai' ? (
                    message.bilingual && message.bilingual.motherTongue ? (
                      // Show bilingual message
                      <BilingualMessage
                        englishText={message.bilingual.english}
                        translatedText={message.bilingual.motherTongue}
                        language={message.bilingual.language}
                        nativeName={message.bilingual.nativeName}
                      />
                    ) : (
                      // Show English only
                      <div className="prose prose-sm max-w-none">
                      {/* Format AI responses with proper styling */}
                      {message.content.split('\n').map((line, index) => {
                        // Bold headers
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <h3 key={index} className="text-lg font-bold text-indigo-700 mt-4 mb-2">
                              {line.replace(/\*\*/g, '')}
                            </h3>
                          )
                        }
                        // Step numbers
                        if (line.match(/^(Step \d+:|Final Answer:|Key Concept:|Common Mistake:)/)) {
                          return (
                            <p key={index} className="font-bold text-gray-900 mt-3 mb-1">
                              {line}
                            </p>
                          )
                        }
                        // Bullet points
                        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                          return (
                            <li key={index} className="ml-4 text-gray-700">
                              {line.replace(/^[•-]\s*/, '')}
                            </li>
                          )
                        }
                        // Horizontal line
                        if (line.trim() === '---') {
                          return <hr key={index} className="my-4 border-gray-300" />
                        }
                        // Formulas or code (anything with backticks or special chars)
                        if (line.includes('=') || line.includes('÷') || line.includes('×')) {
                          return (
                            <p key={index} className="font-mono bg-gray-100 px-3 py-2 rounded my-2 text-gray-800">
                              {line}
                            </p>
                          )
                        }
                        // Regular text
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
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 text-gray-800 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-lg">
                  <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                  <span className="font-semibold">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            {/* Input Mode Selector */}
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
                Voice
              </button>
              <button
                onClick={() => setInputMode('image')}
                className={`px-3 py-1 rounded-full text-sm ${
                  inputMode === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Image
              </button>
              <button
                onClick={() => setInputMode('youtube')}
                className={`px-3 py-1 rounded-full text-sm ${
                  inputMode === 'youtube' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                YouTube
              </button>
              <Link
                to="/math-calculator"
                className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                🧮 Advanced Math
              </Link>
            </div>

            {/* Text Input */}
            {inputMode === 'text' && (
              <div className="flex space-x-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-indigo-500 bg-white text-black"
                  style={{ 
                    color: '#000000', 
                    backgroundColor: '#ffffff'
                  }}
                  rows="2"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Voice Input */}
            {inputMode === 'voice' && (
              <div className="text-center">
                {!isRecording ? (
                  <button
                    onClick={startVoiceRecording}
                    disabled={isLoading}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="h-5 w-5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopVoiceRecording}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2 mx-auto animate-pulse"
                  >
                    <Mic className="h-5 w-5" />
                    <span>🎤 Listening... (Click to stop)</span>
                  </button>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {isRecording 
                    ? '🎤 Speak now... Your voice will be converted to text' 
                    : `Click to start voice recording (Language: ${user.mediumName || 'English'})`
                  }
                </p>
                {voiceError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ {voiceError}
                  </div>
                )}
                {inputText && !isRecording && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">📝 Recognized text:</p>
                    <p className="text-gray-900">{inputText}</p>
                  </div>
                )}
              </div>
            )}

            {/* Image Input */}
            {inputMode === 'image' && (
              <div className="text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
                >
                  <Image className="h-5 w-5" />
                  <span>Upload Image</span>
                </button>
                <p className="text-sm text-gray-600 mt-2">Upload an image for analysis or help</p>
              </div>
            )}

            {/* YouTube Input */}
            {inputMode === 'youtube' && (
              <div className="text-center">
                <button
                  onClick={handleYouTubeUrl}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 mx-auto"
                >
                  <Youtube className="h-5 w-5" />
                  <span>Add YouTube URL</span>
                </button>
                <p className="text-sm text-gray-600 mt-2">Share a YouTube video for analysis or discussion</p>
              </div>
            )}
          </div>
        </div>
          
          {/* Notes Panel */}
          {showNotes && (
            <div className="h-[calc(100vh-300px)]">
              <NotesPanel
                sourceType="ai-chat"
                sourceId="ai-assistant-session"
                subject="General"
                title="AI Chat Notes"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIAssistant