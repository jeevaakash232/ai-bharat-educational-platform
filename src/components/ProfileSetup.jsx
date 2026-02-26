import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { initializeDemoRecordings } from '../utils/demoRecordingsData'
import { 
  BookOpen, 
  ChevronRight, 
  ArrowLeft, 
  Video, 
  Play, 
  Upload,
  Settings,
  Eye,
  Clock
} from 'lucide-react'

const ProfileSetup = () => {
  const [step, setStep] = useState(1)
  const [profileData, setProfileData] = useState({
    board: '',
    class: '',
    department: '',
    videoPreferences: {
      autoPlay: true,
      quality: 'auto',
      subtitles: false,
      playbackSpeed: 1
    }
  })
  const [recordings, setRecordings] = useState([])
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

    // Initialize demo recordings and load them
    initializeDemoRecordings()
    loadRelevantRecordings()
  }, [user, navigate, profileData.class, profileData.department])

  const loadRelevantRecordings = () => {
    const savedRecordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
    
    // Filter recordings based on selected class
    let relevantRecordings = savedRecordings
    if (profileData.class) {
      const classNum = parseInt(profileData.class)
      relevantRecordings = savedRecordings.filter(rec => 
        rec.class === classNum || 
        rec.class === classNum - 1 || 
        rec.class === classNum + 1
      )
    }
    
    // Limit to 3 most popular recordings for preview
    const popularRecordings = relevantRecordings
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3)
    
    setRecordings(popularRecordings)
  }

  if (!user) {
    return null
  }

  const boards = ['State Board', 'CBSE']
  const classes = Array.from({ length: 12 }, (_, i) => i + 1)
  const departments = {
    11: ['Computer Science', 'Biology', 'Commerce', 'Pure Science'],
    12: ['Computer Science', 'Biology', 'Commerce', 'Pure Science']
  }

  const getSubjects = (classNum, dept) => {
    // Get the appropriate language based on user's state and medium selection
    const getLanguageSubject = () => {
      if (user.selectedMedium === 'english') {
        return 'English'
      } else if (user.selectedMedium === 'state') {
        return user.stateLanguage || 'Hindi' // Use state language or default to Hindi
      }
      return 'English' // Default fallback
    }

    const languageSubject = getLanguageSubject()
    
    const baseSubjects = {
      1: [languageSubject, 'English', 'Maths', 'EVS'],
      2: [languageSubject, 'English', 'Maths', 'EVS']
    }

    // Remove duplicate English if language subject is already English
    if (languageSubject === 'English') {
      baseSubjects[1] = ['English', 'Maths', 'EVS']
      baseSubjects[2] = ['English', 'Maths', 'EVS']
    }

    if (classNum <= 2) {
      return baseSubjects[classNum]
    } else if (classNum <= 10) {
      const subjects = [languageSubject, 'English', 'Maths', 'Science', 'Social']
      // Remove duplicate English if language subject is already English
      return languageSubject === 'English' 
        ? ['English', 'Maths', 'Science', 'Social']
        : subjects
    } else {
      const deptSubjects = {
        'Computer Science': [languageSubject, 'English', 'Maths', 'Physics', 'Chemistry', 'Computer Science'],
        'Biology': [languageSubject, 'English', 'Maths', 'Physics', 'Chemistry', 'Zoology', 'Biology', 'Botany'],
        'Commerce': [languageSubject, 'English', 'Maths', 'Business Maths', 'History', 'Commerce', 'Accountancy'],
        'Pure Science': [languageSubject, 'English', 'Physics', 'Chemistry', 'Computer Science', 'Botany', 'Zoology', 'Biology']
      }
      
      const subjects = deptSubjects[dept] || []
      // Remove duplicate English if language subject is already English
      return languageSubject === 'English' 
        ? subjects.filter(subject => subject !== 'English' || subjects.indexOf(subject) === subjects.lastIndexOf(subject))
        : subjects
    }
  }

  const handleNext = () => {
    if (step === 1 && profileData.board) {
      setStep(2)
    } else if (step === 2 && profileData.class) {
      if (parseInt(profileData.class) >= 11) {
        setStep(3)
      } else {
        setStep(4) // Go to video preferences step
      }
    } else if (step === 3 && profileData.department) {
      setStep(4) // Go to video preferences step
    } else if (step === 4) {
      completeSetup()
    }
  }

  const completeSetup = () => {
    const subjects = getSubjects(parseInt(profileData.class), profileData.department)
    const completeProfile = {
      ...profileData,
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

  const handleVideoPreferenceChange = (preference, value) => {
    setProfileData({
      ...profileData,
      videoPreferences: {
        ...profileData.videoPreferences,
        [preference]: value
      }
    })
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          {/* Back Button */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/medium-selection')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1"></div>
          </div>
          
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Profile Setup</h2>
            <p className="text-gray-600">Let's personalize your learning experience</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
              {parseInt(profileData.class) >= 11 && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>3</div>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                <Video className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Step 1: Board Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Your Board</h3>
              <div className="space-y-3">
                {boards.map((board) => (
                  <button
                    key={board}
                    onClick={() => handleChange('board', board)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                      profileData.board === board
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Class Selection */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Your Class</h3>
              <div className="grid-cols-4">
                {classes.map((classNum) => (
                  <button
                    key={classNum}
                    onClick={() => handleChange('class', classNum.toString())}
                    className={`p-3 text-center border-2 rounded-lg transition-colors ${
                      profileData.class === classNum.toString()
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {classNum}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Department Selection (for classes 11-12) */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Your Department</h3>
              <div className="space-y-3">
                {departments[parseInt(profileData.class)]?.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => handleChange('department', dept)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                      profileData.department === dept
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Video Preferences & Recorded Classes Preview */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Video className="h-6 w-6 text-indigo-600" />
                  <span>Video Learning Setup</span>
                </h3>
                <p className="text-gray-600 mb-6">Configure your video learning preferences</p>

                {/* Video Preferences */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Auto-play videos</span>
                    <button
                      onClick={() => handleVideoPreferenceChange('autoPlay', !profileData.videoPreferences.autoPlay)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        profileData.videoPreferences.autoPlay ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        profileData.videoPreferences.autoPlay ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium mb-2">Default Playback Speed</label>
                    <select
                      value={profileData.videoPreferences.playbackSpeed}
                      onChange={(e) => handleVideoPreferenceChange('playbackSpeed', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x (Normal)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium mb-2">Video Quality</label>
                    <select
                      value={profileData.videoPreferences.quality}
                      onChange={(e) => handleVideoPreferenceChange('quality', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="auto">Auto (Recommended)</option>
                      <option value="720p">720p HD</option>
                      <option value="480p">480p</option>
                      <option value="360p">360p</option>
                    </select>
                  </div>
                </div>

                {/* Recorded Classes Preview */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Recommended for You</h4>
                    <Link 
                      to="/live-classes" 
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View All →
                    </Link>
                  </div>

                  {recordings.length > 0 ? (
                    <div className="space-y-3">
                      {recordings.map((recording) => (
                        <div key={recording.id} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                          <div className="w-16 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-800 truncate">{recording.title}</h5>
                            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{recording.views}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(recording.duration)}</span>
                              </span>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                {recording.subject}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No recordings available yet</p>
                      <p className="text-xs">Check back later for new content!</p>
                    </div>
                  )}
                </div>

                {/* Quick Access Buttons */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">Quick Access</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/live-classes"
                      className="flex items-center justify-center space-x-2 p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      <span className="text-sm font-medium">Watch Videos</span>
                    </Link>
                    {user.userType === 'teacher' && (
                      <Link
                        to="/upload-recording"
                        className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-medium">Upload Video</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            className="btn btn-primary w-full mt-8"
            disabled={
              (step === 1 && !profileData.board) ||
              (step === 2 && !profileData.class) ||
              (step === 3 && !profileData.department)
            }
          >
            {step === 4 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetup