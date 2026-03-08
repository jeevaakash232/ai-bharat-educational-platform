import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSubjectsForClass, getHigherSecondaryStreams, requiresStreamSelection, getClassLevel } from '../data/curriculumStructure'
import { BookOpen, ChevronRight, ArrowLeft, GraduationCap } from 'lucide-react'

const ProfileSetup = () => {
  const [step, setStep] = useState(1)
  const [profileData, setProfileData] = useState({
    board: '',
    class: '',
    stream: '', // For Classes 11-12
    subjects: []
  })
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.userType !== 'student') {
      navigate('/dashboard')
    } else if (!user.selectedState) {
      navigate('/state-selection')
    } else if (!user.selectedMedium) {
      navigate('/medium-selection')
    } else if (user.profileComplete) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  if (!user) return null

  const boards = ['State Board', 'CBSE', 'ICSE']
  const classes = Array.from({ length: 12 }, (_, i) => i + 1)
  const streams = getHigherSecondaryStreams()

  const handleNext = () => {
    const classNum = parseInt(profileData.class)
    
    if (step === 1 && profileData.board) {
      setStep(2)
    } else if (step === 2 && profileData.class) {
      if (requiresStreamSelection(classNum)) {
        setStep(3) // Go to stream selection
      } else {
        completeSetup()
      }
    } else if (step === 3 && profileData.stream) {
      completeSetup()
    }
  }

  const completeSetup = () => {
    const classNum = parseInt(profileData.class)
    const subjects = getSubjectsForClass(classNum, profileData.stream, user.stateLanguage || 'Tamil')
      .map(s => s.name)
    
    const completeProfile = {
      board: profileData.board,
      class: classNum,
      stream: profileData.stream || null,
      subjects,
      profileComplete: true
    }
    
    updateProfile(completeProfile)
    navigate('/dashboard')
  }

  const handleChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="card">
          {/* Back Button */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/medium-selection')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center mb-8">
            <GraduationCap className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Academic Profile</h2>
            <p className="text-gray-600 mt-2">Tell us about your education</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
              {requiresStreamSelection(parseInt(profileData.class)) && (
                <>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
                </>
              )}
            </div>
          </div>

          {/* Step 1: Board Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-center">Select Your Board</h3>
              <p className="text-gray-600 text-center mb-6">Choose your educational board</p>
              <div className="space-y-3">
                {boards.map((board) => (
                  <button
                    key={board}
                    onClick={() => handleChange('board', board)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                      profileData.board === board
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="font-semibold text-lg">{board}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Class Selection */}
          {step === 2 && (
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-center">Select Your Class</h3>
              <p className="text-gray-600 text-center mb-6">Choose your current class</p>
              <div className="grid grid-cols-4 gap-3">
                {classes.map((classNum) => (
                  <button
                    key={classNum}
                    onClick={() => handleChange('class', classNum.toString())}
                    className={`p-4 text-center border-2 rounded-xl transition-all ${
                      profileData.class === classNum.toString()
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-2xl font-bold">{classNum}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {getClassLevel(classNum).split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Stream Selection (for Classes 11-12) */}
          {step === 3 && requiresStreamSelection(parseInt(profileData.class)) && (
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-center">Select Your Stream</h3>
              <p className="text-gray-600 text-center mb-6">Choose your specialization for Classes 11-12</p>
              <div className="space-y-3">
                {streams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => handleChange('stream', stream.id)}
                    className={`w-full p-5 text-left border-2 rounded-xl transition-all ${
                      profileData.stream === stream.id
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2">{stream.name}</div>
                    <div className="text-sm text-gray-600">
                      Subjects: {stream.subjects.map(s => s.name).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject Preview */}
          {profileData.class && (step === 2 || step === 3) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Your Subjects:</h4>
              <div className="flex flex-wrap gap-2">
                {getSubjectsForClass(
                  parseInt(profileData.class), 
                  profileData.stream,
                  user.stateLanguage || 'Tamil'
                ).map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm border border-blue-200"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            className="btn btn-primary w-full mt-8 py-3 text-lg"
            disabled={
              (step === 1 && !profileData.board) ||
              (step === 2 && !profileData.class) ||
              (step === 3 && !profileData.stream)
            }
          >
            {step === 3 || (step === 2 && !requiresStreamSelection(parseInt(profileData.class))) 
              ? 'Complete Setup' 
              : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetup
