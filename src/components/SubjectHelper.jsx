import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Calculator, Microscope, Globe, Code, PenTool, TrendingUp, Building, FileText, Clock } from 'lucide-react'
import { getEnhancedGroqResponse } from '../services/enhancedGroqService'

const SubjectHelper = ({ onQuestionSelect }) => {
  const { user } = useAuth()
  const [selectedSubject, setSelectedSubject] = useState(null)

  const subjectIcons = {
    Tamil: PenTool,
    English: BookOpen,
    Maths: Calculator,
    Science: Microscope,
    Social: Globe,
    Physics: Microscope,
    Chemistry: Microscope,
    Biology: Microscope,
    Zoology: Microscope,
    Botany: Microscope,
    'Computer Science': Code,
    'Business Maths': TrendingUp,
    Commerce: Building,
    Accountancy: FileText,
    History: Clock
  }

  const quickQuestions = {
    Tamil: [
      'Explain the theme of a Tamil poem',
      'Help me write an essay in Tamil',
      'What are the grammar rules for Tamil?',
      'Analyze this Tamil literature piece',
      'Translate this passage to English'
    ],
    English: [
      'Explain the character development in this story',
      'Help me write a formal letter',
      'What are the literary devices used here?',
      'Correct my grammar in this sentence',
      'Summarize this passage for me'
    ],
    Maths: [
      'Solve this quadratic equation: x² + 5x + 6 = 0',
      'Find the derivative of f(x) = x³ + 2x²',
      'Calculate the area of a triangle with sides 3, 4, 5',
      'Explain the Pythagorean theorem',
      'Help me with trigonometry problems'
    ],
    Science: [
      'Explain the process of photosynthesis',
      'How do electric circuits work?',
      'What happens during chemical reactions?',
      'Describe the human digestive system',
      'Explain Newton\'s laws of motion'
    ],
    Physics: [
      'Explain Newton\'s laws of motion',
      'How does light refraction work?',
      'Calculate velocity and acceleration',
      'What is electromagnetic induction?',
      'Explain wave properties and behavior'
    ],
    Chemistry: [
      'Balance this chemical equation: H₂ + O₂ → H₂O',
      'Explain atomic structure and bonding',
      'What are acids and bases?',
      'Describe organic chemistry reactions',
      'How do catalysts work in reactions?'
    ],
    Biology: [
      'Explain cell structure and functions',
      'How does the circulatory system work?',
      'What is DNA and genetics?',
      'Describe the process of evolution',
      'Explain ecosystem and food chains'
    ],
    Zoology: [
      'Explain animal classification systems',
      'How do mammals differ from reptiles?',
      'What is animal behavior and ethology?',
      'Describe vertebrate and invertebrate differences',
      'Explain animal adaptation and evolution'
    ],
    Botany: [
      'Explain plant structure and anatomy',
      'How does photosynthesis work in detail?',
      'What are plant hormones and their functions?',
      'Describe plant reproduction and life cycles',
      'Explain plant adaptations to environments'
    ],
    Social: [
      'Explain the causes of World War I',
      'What is democracy and its features?',
      'Describe India\'s economic development',
      'Explain climate and weather patterns',
      'What are fundamental rights in India?'
    ],
    'Computer Science': [
      'Write a Python program to find factorial',
      'Explain object-oriented programming',
      'What are data structures and algorithms?',
      'How do databases work?',
      'Create a simple web page with HTML'
    ],
    'Business Maths': [
      'Calculate compound interest for business loan',
      'Solve matrix problems for business analysis',
      'Find break-even point for a product',
      'Calculate depreciation using different methods',
      'Analyze business statistics and trends'
    ],
    Commerce: [
      'Explain different types of business organizations',
      'What is marketing mix and its components?',
      'Describe the functions of management',
      'Explain international trade procedures',
      'What are the principles of entrepreneurship?'
    ],
    Accountancy: [
      'Prepare a Trading and Profit & Loss Account',
      'Calculate financial ratios for analysis',
      'Explain partnership admission procedures',
      'Prepare cash flow statement',
      'What is goodwill and its valuation methods?'
    ],
    History: [
      'Explain the causes of Indian Revolt of 1857',
      'Describe the Mughal administrative system',
      'What were the effects of Industrial Revolution?',
      'Analyze the Indian National Movement',
      'Explain the partition of India in 1947'
    ]
  }

  const handleSubjectClick = (subject) => {
    setSelectedSubject(selectedSubject === subject ? null : subject)
  }

  const handleQuestionClick = (question) => {
    onQuestionSelect(question)
    setSelectedSubject(null)
  }

  if (!user?.subjects || user.subjects.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Subject Help</h3>
      
      {/* Subject Icons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {user.subjects.map((subject) => {
          const Icon = subjectIcons[subject] || BookOpen
          const isSelected = selectedSubject === subject
          
          return (
            <button
              key={subject}
              onClick={() => handleSubjectClick(subject)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{subject}</span>
            </button>
          )
        })}
      </div>

      {/* Quick Questions */}
      {selectedSubject && quickQuestions[selectedSubject] && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Quick {selectedSubject} Questions:
          </h4>
          <div className="space-y-2">
            {quickQuestions[selectedSubject].map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border text-sm text-gray-700 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Study Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Ask specific questions about your subjects for detailed explanations. 
          I can help with homework, concept clarification, and exam preparation!
        </p>
      </div>
    </div>
  )
}

export default SubjectHelper