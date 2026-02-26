import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Globe, ArrowLeft } from 'lucide-react'

const MediumSelection = () => {
  const [selectedMedium, setSelectedMedium] = useState('')
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.userType !== 'student') {
      navigate('/dashboard')
    } else if (!user.selectedState) {
      navigate('/state-selection')
    } else if (user.selectedMedium) {
      navigate('/profile-setup')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  // State to language mapping
  const stateLanguageMap = {
    'Tamil Nadu': 'Tamil',
    'Kerala': 'Malayalam',
    'Karnataka': 'Kannada',
    'Andhra Pradesh': 'Telugu',
    'Telangana': 'Telugu',
    'Maharashtra': 'Marathi',
    'Gujarat': 'Gujarati',
    'West Bengal': 'Bengali',
    'Punjab': 'Punjabi',
    'Haryana': 'Hindi',
    'Rajasthan': 'Hindi',
    'Madhya Pradesh': 'Hindi',
    'Uttar Pradesh': 'Hindi',
    'Bihar': 'Hindi',
    'Jharkhand': 'Hindi',
    'Chhattisgarh': 'Hindi',
    'Uttarakhand': 'Hindi',
    'Himachal Pradesh': 'Hindi',
    'Delhi': 'Hindi',
    'Assam': 'Assamese',
    'Odisha': 'Odia',
    'Goa': 'Konkani',
    'Manipur': 'Manipuri',
    'Tripura': 'Bengali',
    'Meghalaya': 'English',
    'Nagaland': 'English',
    'Mizoram': 'Mizo',
    'Arunachal Pradesh': 'English',
    'Sikkim': 'Nepali',
    'Jammu and Kashmir': 'Urdu',
    'Ladakh': 'Ladakhi',
    'Chandigarh': 'Hindi',
    'Puducherry': 'Tamil',
    'Andaman and Nicobar Islands': 'Hindi',
    'Dadra and Nagar Haveli and Daman and Diu': 'Gujarati',
    'Lakshadweep': 'Malayalam'
  }

  const stateLanguage = stateLanguageMap[user.selectedState] || 'Hindi'
  
  const availableMediums = [
    {
      id: 'english',
      name: 'English Medium',
      description: 'All subjects taught in English',
      icon: '🇬🇧'
    },
    {
      id: 'state',
      name: `${stateLanguage} Medium`,
      description: `All subjects taught in ${stateLanguage}`,
      icon: '🇮🇳'
    }
  ]

  const handleMediumSelect = (medium) => {
    setSelectedMedium(medium)
  }

  const handleNext = () => {
    if (selectedMedium) {
      const mediumData = {
        selectedMedium: selectedMedium.id,
        mediumName: selectedMedium.name,
        stateLanguage: stateLanguage
      }
      updateProfile(mediumData)
      navigate('/profile-setup')
    }
  }

  const handleBack = () => {
    navigate('/state-selection')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="card">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800">Select Medium of Instruction</h2>
              <p className="text-gray-600">Choose your preferred language for learning</p>
              <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg px-3 py-1 inline-block">
                Selected State: {user.selectedState}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {availableMediums.map((medium) => (
              <button
                key={medium.id}
                onClick={() => handleMediumSelect(medium)}
                className={`w-full p-5 text-left border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                  selectedMedium?.id === medium.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{medium.icon}</div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      selectedMedium?.id === medium.id ? 'text-indigo-700' : 'text-gray-800'
                    }`}>
                      {medium.name}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      selectedMedium?.id === medium.id ? 'text-indigo-600' : 'text-gray-600'
                    }`}>
                      {medium.description}
                    </p>
                  </div>
                  {selectedMedium?.id === medium.id && (
                    <div className="text-indigo-600">
                      <Globe className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleNext}
              className={`btn btn-primary px-8 py-3 text-lg ${
                !selectedMedium ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
              disabled={!selectedMedium}
            >
              Continue to Class Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediumSelection