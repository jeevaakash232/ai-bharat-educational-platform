import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MathVisualizer from './MathVisualizer'
import ScienceVisualizer from './ScienceVisualizer'
import { 
  Calculator, 
  Atom, 
  Globe, 
  BookOpen, 
  Code, 
  TrendingUp,
  Play,
  Eye,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react'

const VisualizationHub = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeSubject, setActiveSubject] = useState('mathematics')
  const [selectedTopic, setSelectedTopic] = useState('')

  const visualizationSubjects = {
    mathematics: {
      icon: Calculator,
      title: 'Mathematics',
      color: 'blue',
      topics: [
        'Algebra - Quadratic Equations',
        'Geometry - Triangles and Circles', 
        'Calculus - Derivatives and Integrals',
        'Statistics - Data Analysis',
        'Trigonometry - Sine and Cosine',
        'Probability - Random Events'
      ],
      component: MathVisualizer
    },
    physics: {
      icon: Atom,
      title: 'Physics',
      color: 'purple',
      topics: [
        'Motion - Projectile and Circular',
        'Forces - Newton\'s Laws',
        'Energy - Kinetic and Potential',
        'Waves - Sound and Light',
        'Electricity - Circuits and Fields',
        'Magnetism - Magnetic Fields'
      ],
      component: ScienceVisualizer
    },
    chemistry: {
      icon: Atom,
      title: 'Chemistry',
      color: 'green',
      topics: [
        'Molecules - Structure and Bonding',
        'Reactions - Chemical Equations',
        'Acids and Bases - pH Scale',
        'Periodic Table - Element Properties',
        'Organic Chemistry - Carbon Compounds',
        'States of Matter - Solid, Liquid, Gas'
      ],
      component: ScienceVisualizer
    },
    biology: {
      icon: Globe,
      title: 'Biology',
      color: 'emerald',
      topics: [
        'Cells - Structure and Function',
        'Photosynthesis - Energy Conversion',
        'DNA - Genetic Information',
        'Evolution - Natural Selection',
        'Ecosystems - Food Chains',
        'Human Body - Organ Systems'
      ],
      component: ScienceVisualizer
    },
    geography: {
      icon: Globe,
      title: 'Geography',
      color: 'cyan',
      topics: [
        'Earth Structure - Layers and Plates',
        'Climate - Weather Patterns',
        'Rivers - Water Cycle',
        'Mountains - Formation Process',
        'Population - Demographics',
        'Resources - Natural Distribution'
      ],
      component: null // Will create later
    },
    computerScience: {
      icon: Code,
      title: 'Computer Science',
      color: 'indigo',
      topics: [
        'Algorithms - Sorting and Searching',
        'Data Structures - Arrays and Trees',
        'Programming - Logic Flow',
        'Networks - Internet Protocols',
        'Databases - Data Organization',
        'AI - Machine Learning Basics'
      ],
      component: null // Will create later
    }
  }

  const getSubjectColor = (subject, type = 'bg') => {
    const color = visualizationSubjects[subject]?.color || 'gray'
    const colorMap = {
      bg: {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
        emerald: 'bg-emerald-500',
        cyan: 'bg-cyan-500',
        indigo: 'bg-indigo-500',
        gray: 'bg-gray-500'
      },
      border: {
        blue: 'border-blue-500',
        purple: 'border-purple-500',
        green: 'border-green-500',
        emerald: 'border-emerald-500',
        cyan: 'border-cyan-500',
        indigo: 'border-indigo-500',
        gray: 'border-gray-500'
      },
      text: {
        blue: 'text-blue-700',
        purple: 'text-purple-700',
        green: 'text-green-700',
        emerald: 'text-emerald-700',
        cyan: 'text-cyan-700',
        indigo: 'text-indigo-700',
        gray: 'text-gray-700'
      }
    }
    return colorMap[type][color]
  }

  const renderVisualization = () => {
    const subject = visualizationSubjects[activeSubject]
    if (!subject?.component) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <subject.icon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {subject.title} Visualizations
          </h3>
          <p className="text-gray-500 mb-4">
            Interactive visualizations for {subject.title} are coming soon!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 text-sm">
              🚧 We're working on amazing visual learning tools for {subject.title}. 
              Check back soon for interactive simulations and demonstrations!
            </p>
          </div>
        </div>
      )
    }

    const VisualizationComponent = subject.component
    return (
      <VisualizationComponent 
        subject={activeSubject}
        topic={selectedTopic}
      />
    )
  }

  const availableSubjects = user?.subjects || Object.keys(visualizationSubjects)

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4 w-full md:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm md:text-base">Back</span>
              </button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
                  🎨 Interactive Learning Visualizations
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Explore concepts through interactive animations and visual demonstrations
                </p>
              </div>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm md:text-base">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subject Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">Choose Subject</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {Object.entries(visualizationSubjects)
              .filter(([key]) => availableSubjects.includes(key.charAt(0).toUpperCase() + key.slice(1)) || 
                                 availableSubjects.includes(key) ||
                                 key === 'mathematics' && availableSubjects.includes('Maths'))
              .map(([key, subject]) => {
                const Icon = subject.icon
                const isActive = activeSubject === key
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveSubject(key)
                      setSelectedTopic('')
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isActive
                        ? `${getSubjectColor(key, 'border')} bg-opacity-10 ${getSubjectColor(key, 'bg')} bg-opacity-10`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      isActive ? getSubjectColor(key, 'text') : 'text-gray-600'
                    }`} />
                    <div className={`font-semibold text-sm ${
                      isActive ? getSubjectColor(key, 'text') : 'text-gray-700'
                    }`}>
                      {subject.title}
                    </div>
                  </button>
                )
              })}
          </div>
        </div>

        {/* Topic Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
            {visualizationSubjects[activeSubject]?.title} Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visualizationSubjects[activeSubject]?.topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setSelectedTopic(topic)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  selectedTopic === topic
                    ? `${getSubjectColor(activeSubject, 'border')} bg-opacity-10 ${getSubjectColor(activeSubject, 'bg')} bg-opacity-10`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-medium ${
                  selectedTopic === topic ? getSubjectColor(activeSubject, 'text') : 'text-gray-800'
                }`}>
                  {topic.split(' - ')[0]}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {topic.split(' - ')[1]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">50+</div>
                <div className="text-sm text-gray-600">Visualizations</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <div className="flex items-center">
              <Play className="h-6 md:h-8 w-6 md:w-8 text-green-500 mr-2 md:mr-3" />
              <div>
                <div className="text-lg md:text-2xl font-bold text-gray-800">Interactive</div>
                <div className="text-xs md:text-sm text-gray-600">Animations</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 md:h-8 w-6 md:w-8 text-purple-500 mr-2 md:mr-3" />
              <div>
                <div className="text-lg md:text-2xl font-bold text-gray-800">Real-time</div>
                <div className="text-xs md:text-sm text-gray-600">Updates</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <div className="flex items-center">
              <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-orange-500 mr-2 md:mr-3" />
              <div>
                <div className="text-lg md:text-2xl font-bold text-gray-800">All Classes</div>
                <div className="text-xs md:text-sm text-gray-600">1-12 Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        {renderVisualization()}

        {/* Learning Tips */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mt-4 md:mt-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
            💡 How to Use Visualizations Effectively
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800 mb-2">1. Observe</div>
              <p className="text-blue-700 text-sm">
                Watch the animation carefully and notice patterns and changes.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-800 mb-2">2. Interact</div>
              <p className="text-green-700 text-sm">
                Use controls to change parameters and see how it affects the result.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-800 mb-2">3. Question</div>
              <p className="text-purple-700 text-sm">
                Ask yourself "what if" questions and test your predictions.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="font-semibold text-orange-800 mb-2">4. Apply</div>
              <p className="text-orange-700 text-sm">
                Connect what you see to real-world examples and problems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisualizationHub