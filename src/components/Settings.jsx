import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSubjectsForClass, getHigherSecondaryStreams, requiresStreamSelection } from '../data/curriculumStructure'
import { ArrowLeft, User, MapPin, BookOpen, GraduationCap, Save, Edit, Cloud } from 'lucide-react'

// Version: 2026-02-27 21:31 - Fixed stateLanguage derivation from state instead of medium

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    selectedState: '',
    selectedMedium: '',
    mediumName: '',
    stateLanguage: '',
    class: '',
    board: '',
    stream: '',
    subjects: []
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Derive stateLanguage from state, not from mediumName
    let stateLanguage = user.stateLanguage || ''
    
    if (!stateLanguage && user.selectedState) {
      const stateLanguageMap = {
        'Tamil Nadu': 'Tamil',
        'Kerala': 'Malayalam',
        'Karnataka': 'Kannada',
        'Andhra Pradesh': 'Telugu',
        'Telangana': 'Telugu',
        'Maharashtra': 'Marathi',
        'West Bengal': 'Bengali',
        'Gujarat': 'Gujarati',
        'Punjab': 'Punjabi',
        'Odisha': 'Odia',
        'Assam': 'Assamese',
        'Bihar': 'Hindi',
        'Uttar Pradesh': 'Hindi',
        'Madhya Pradesh': 'Hindi',
        'Rajasthan': 'Hindi',
        'Haryana': 'Hindi',
        'Himachal Pradesh': 'Hindi',
        'Chhattisgarh': 'Hindi',
        'Jharkhand': 'Hindi',
        'Uttarakhand': 'Hindi',
        'Goa': 'Konkani',
        'Manipur': 'Manipuri',
        'Meghalaya': 'English',
        'Mizoram': 'Mizo',
        'Nagaland': 'English',
        'Tripura': 'Bengali',
        'Sikkim': 'Nepali'
      }
      stateLanguage = stateLanguageMap[user.selectedState] || 'Tamil'
    }
    
    // Load current user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      selectedState: user.selectedState || '',
      selectedMedium: user.selectedMedium || '',
      mediumName: user.mediumName || '',
      stateLanguage: stateLanguage,
      class: user.class || '',
      board: user.board || 'State Board',
      stream: user.stream || '',
      subjects: user.subjects || []
    })
  }, [user, navigate])

  // Update subjects when class or stream changes
  useEffect(() => {
    if (formData.class && formData.selectedState) {
      const classNum = parseInt(formData.class)
      
      // ALWAYS derive stateLanguage from selectedState
      const stateLanguageMap = {
        'Tamil Nadu': 'Tamil',
        'Kerala': 'Malayalam',
        'Karnataka': 'Kannada',
        'Andhra Pradesh': 'Telugu',
        'Telangana': 'Telugu',
        'Maharashtra': 'Marathi',
        'West Bengal': 'Bengali',
        'Gujarat': 'Gujarati',
        'Punjab': 'Punjabi',
        'Odisha': 'Odia',
        'Assam': 'Assamese',
        'Bihar': 'Hindi',
        'Uttar Pradesh': 'Hindi',
        'Madhya Pradesh': 'Hindi',
        'Rajasthan': 'Hindi',
        'Haryana': 'Hindi',
        'Himachal Pradesh': 'Hindi',
        'Chhattisgarh': 'Hindi',
        'Jharkhand': 'Hindi',
        'Uttarakhand': 'Hindi',
        'Goa': 'Konkani',
        'Manipur': 'Manipuri',
        'Meghalaya': 'English',
        'Mizoram': 'Mizo',
        'Nagaland': 'English',
        'Tripura': 'Bengali',
        'Sikkim': 'Nepali'
      }
      const stateLanguage = stateLanguageMap[formData.selectedState] || 'Tamil'
      
      console.log('Settings: Getting subjects for class', classNum, 'stream', formData.stream, 'language', stateLanguage)
      const subjects = [...new Set(getSubjectsForClass(classNum, formData.stream, stateLanguage)
        .map(s => s.name))]
      console.log('Settings: Subjects:', subjects)
      
      setFormData(prev => ({
        ...prev,
        stateLanguage: stateLanguage, // Always update stateLanguage
        subjects
      }))
    }
  }, [formData.class, formData.stream, formData.selectedState])

  // State-Medium mapping
  const stateMediumMapping = {
    'Tamil Nadu': ['Tamil Medium', 'English Medium'],
    'Kerala': ['Malayalam Medium', 'English Medium'],
    'Karnataka': ['Kannada Medium', 'English Medium'],
    'Andhra Pradesh': ['Telugu Medium', 'English Medium'],
    'Telangana': ['Telugu Medium', 'English Medium'],
    'Maharashtra': ['Marathi Medium', 'English Medium'],
    'West Bengal': ['Bengali Medium', 'English Medium'],
    'Gujarat': ['Gujarati Medium', 'English Medium'],
    'Punjab': ['Punjabi Medium', 'English Medium'],
    'Odisha': ['Odia Medium', 'English Medium'],
    'Assam': ['Assamese Medium', 'English Medium'],
    'Bihar': ['Hindi Medium', 'English Medium'],
    'Uttar Pradesh': ['Hindi Medium', 'English Medium'],
    'Madhya Pradesh': ['Hindi Medium', 'English Medium'],
    'Rajasthan': ['Hindi Medium', 'English Medium'],
    'Haryana': ['Hindi Medium', 'English Medium'],
    'Himachal Pradesh': ['Hindi Medium', 'English Medium'],
    'Chhattisgarh': ['Hindi Medium', 'English Medium'],
    'Jharkhand': ['Hindi Medium', 'English Medium'],
    'Uttarakhand': ['Hindi Medium', 'English Medium'],
    'Goa': ['Konkani Medium', 'English Medium'],
    'Manipur': ['Manipuri Medium', 'English Medium'],
    'Meghalaya': ['English Medium'],
    'Mizoram': ['Mizo Medium', 'English Medium'],
    'Nagaland': ['English Medium'],
    'Tripura': ['Bengali Medium', 'English Medium'],
    'Sikkim': ['Nepali Medium', 'English Medium']
  }

  const indianStates = Object.keys(stateMediumMapping).sort()
  const availableMediums = formData.selectedState ? stateMediumMapping[formData.selectedState] || [] : []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Reset medium if state changes
    if (name === 'selectedState') {
      setFormData(prev => ({
        ...prev,
        selectedMedium: '',
        mediumName: ''
      }))
    }
    
    // Reset stream if class changes and new class doesn't require stream
    if (name === 'class' && !requiresStreamSelection(parseInt(value))) {
      setFormData(prev => ({
        ...prev,
        stream: ''
      }))
    }
  }

  const handleMediumChange = (medium) => {
    const mediumType = medium === 'English Medium' ? 'english' : 'state'
    
    // Determine state language based on selected state, not medium
    // The regional language is always the state's language, regardless of medium
    let stateLanguage = 'Tamil' // Default
    
    if (formData.selectedState) {
      const stateLanguageMap = {
        'Tamil Nadu': 'Tamil',
        'Kerala': 'Malayalam',
        'Karnataka': 'Kannada',
        'Andhra Pradesh': 'Telugu',
        'Telangana': 'Telugu',
        'Maharashtra': 'Marathi',
        'West Bengal': 'Bengali',
        'Gujarat': 'Gujarati',
        'Punjab': 'Punjabi',
        'Odisha': 'Odia',
        'Assam': 'Assamese',
        'Bihar': 'Hindi',
        'Uttar Pradesh': 'Hindi',
        'Madhya Pradesh': 'Hindi',
        'Rajasthan': 'Hindi',
        'Haryana': 'Hindi',
        'Himachal Pradesh': 'Hindi',
        'Chhattisgarh': 'Hindi',
        'Jharkhand': 'Hindi',
        'Uttarakhand': 'Hindi',
        'Goa': 'Konkani',
        'Manipur': 'Manipuri',
        'Meghalaya': 'English',
        'Mizoram': 'Mizo',
        'Nagaland': 'English',
        'Tripura': 'Bengali',
        'Sikkim': 'Nepali'
      }
      stateLanguage = stateLanguageMap[formData.selectedState] || 'Tamil'
    }
    
    setFormData(prev => ({
      ...prev,
      selectedMedium: mediumType,
      mediumName: medium,
      stateLanguage: stateLanguage
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      // Ensure stateLanguage is set correctly before saving
      let finalStateLanguage = formData.stateLanguage
      if (!finalStateLanguage && formData.selectedState) {
        const stateLanguageMap = {
          'Tamil Nadu': 'Tamil',
          'Kerala': 'Malayalam',
          'Karnataka': 'Kannada',
          'Andhra Pradesh': 'Telugu',
          'Telangana': 'Telugu',
          'Maharashtra': 'Marathi',
          'West Bengal': 'Bengali',
          'Gujarat': 'Gujarati',
          'Punjab': 'Punjabi',
          'Odisha': 'Odia',
          'Assam': 'Assamese',
          'Bihar': 'Hindi',
          'Uttar Pradesh': 'Hindi',
          'Madhya Pradesh': 'Hindi',
          'Rajasthan': 'Hindi',
          'Haryana': 'Hindi',
          'Himachal Pradesh': 'Hindi',
          'Chhattisgarh': 'Hindi',
          'Jharkhand': 'Hindi',
          'Uttarakhand': 'Hindi',
          'Goa': 'Konkani',
          'Manipur': 'Manipuri',
          'Meghalaya': 'English',
          'Mizoram': 'Mizo',
          'Nagaland': 'English',
          'Tripura': 'Bengali',
          'Sikkim': 'Nepali'
        }
        finalStateLanguage = stateLanguageMap[formData.selectedState] || 'Tamil'
      }
      
      // Update profile
      updateProfile({
        name: formData.name,
        selectedState: formData.selectedState,
        selectedMedium: formData.selectedMedium,
        mediumName: formData.mediumName,
        stateLanguage: finalStateLanguage,
        class: formData.class,
        board: formData.board,
        stream: formData.stream,
        subjects: formData.subjects,
        profileComplete: true
      })
      
      alert('Settings saved successfully!')
      setIsEditing(false)
      setLoading(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center space-x-3 md:space-x-4 w-full md:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-xs md:text-sm text-gray-600">Manage your profile and preferences</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl">
        {/* Personal Information */}
        <div className="card mb-4 md:mb-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-6">
            <User className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.name || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900 py-2">{formData.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <p className="text-gray-900 py-2 capitalize">{user.userType}</p>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        {(user.userType === 'student' || user.userType === 'teacher') && (
          <>
            <div className="card mb-4 md:mb-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Location & Medium</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <select
                      name="selectedState"
                      value={formData.selectedState}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{formData.selectedState || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.mediumName}
                      onChange={(e) => handleMediumChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={!formData.selectedState}
                    >
                      <option value="">Select Medium</option>
                      {availableMediums.map(medium => (
                        <option key={medium} value={medium}>{medium}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{formData.mediumName || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Board
                  </label>
                  {isEditing ? (
                    <select
                      name="board"
                      value={formData.board}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="State Board">State Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{formData.board || 'State Board'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card mb-4 md:mb-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Class & Subjects</h2>
              </div>
              
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                {isEditing ? (
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(cls => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">Class {formData.class || 'Not set'}</p>
                )}
              </div>
              
              {/* Stream Selection for Classes 11-12 */}
              {requiresStreamSelection(parseInt(formData.class)) && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream
                  </label>
                  {isEditing ? (
                    <select
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Stream</option>
                      {getHigherSecondaryStreams().map(stream => (
                        <option key={stream.id} value={stream.id}>{stream.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">
                      {formData.stream ? getHigherSecondaryStreams().find(s => s.id === formData.stream)?.name : 'Not set'}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Subjects
                </label>
                {isEditing ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                      <p className="text-sm text-blue-800">
                        ℹ️ Subjects are automatically set based on your class{requiresStreamSelection(parseInt(formData.class)) ? ' and stream' : ''}.
                      </p>
                    </div>
                    {/* Debug Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-xs">
                      <p><strong>Debug Info:</strong></p>
                      <p>Medium: {formData.mediumName || 'Not set'}</p>
                      <p>State Language: {formData.stateLanguage || 'Not set'}</p>
                      <p>Class: {formData.class}</p>
                      <p>Stream: {formData.stream || 'None'}</p>
                    </div>
                  </>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.length > 0 ? (
                    [...new Set(formData.subjects)].map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No subjects selected</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm md:text-base"
            >
              <Save className="h-4 w-4 md:h-5 md:w-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                // Reset form data
                setFormData({
                  name: user.name || '',
                  email: user.email || '',
                  selectedState: user.selectedState || '',
                  selectedMedium: user.selectedMedium || '',
                  mediumName: user.mediumName || '',
                  stateLanguage: user.stateLanguage || '',
                  class: user.class || '',
                  board: user.board || 'State Board',
                  stream: user.stream || '',
                  subjects: user.subjects || []
                })
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Data Migration Section */}
        {!isEditing && (
          <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Cloud className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cloud Data Migration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Transfer all your data from local storage to AWS S3 cloud storage for better security and accessibility across devices.
                </p>
                <button
                  onClick={() => navigate('/data-migration')}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Cloud className="h-5 w-5" />
                  <span>Migrate to Cloud</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Settings
