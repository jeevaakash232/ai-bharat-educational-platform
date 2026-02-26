import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, MapPin, Globe, ArrowRight } from 'lucide-react'

const StateSelection = () => {
  const [selectedState, setSelectedState] = useState('')
  const [selectedMedium, setSelectedMedium] = useState('')
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.userType !== 'student' && user.userType !== 'teacher') {
      navigate('/dashboard')
    } else if (user.selectedState && user.selectedMedium) {
      navigate('/profile-setup')
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  // Complete mapping of 26 Indian states to their mediums
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

  // All 26 Indian states (excluding UTs)
  const indianStates = Object.keys(stateMediumMapping).sort()

  // Get available mediums for selected state
  const availableMediums = selectedState ? stateMediumMapping[selectedState] || [] : []

  // Handle state selection
  const handleStateChange = (state) => {
    setSelectedState(state)
    setSelectedMedium('') // Reset medium when state changes
  }

  // Handle medium selection
  const handleMediumChange = (medium) => {
    setSelectedMedium(medium)
  }

  // Get state language from medium
  const getStateLanguage = (medium) => {
    return medium.replace(' Medium', '')
  }

  // Get medium type (state/english)
  const getMediumType = (medium) => {
    return medium === 'English Medium' ? 'english' : 'state'
  }

  const handleNext = () => {
    if (selectedState && selectedMedium) {
      const stateLanguage = getStateLanguage(selectedMedium)
      const mediumType = getMediumType(selectedMedium)
      
      updateProfile({ 
        selectedState,
        selectedMedium: mediumType,
        mediumName: selectedMedium,
        stateLanguage: stateLanguage
      })
      navigate('/profile-setup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800">Select Your State & Medium</h2>
            <p className="text-gray-600 mt-2">Choose your state and preferred medium of instruction</p>
          </div>

          <div className="space-y-6">
            {/* State Dropdown */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Select State *
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Choose your state</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select your state to see available mediums
              </p>
            </div>

            {/* Medium Dropdown */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Select Medium of Instruction *
              </label>
              <select
                value={selectedMedium}
                onChange={(e) => handleMediumChange(e.target.value)}
                disabled={!selectedState || availableMediums.length === 0}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  !selectedState ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">
                  {!selectedState ? 'Select state first' : 'Choose medium of instruction'}
                </option>
                {availableMediums.map((medium) => (
                  <option key={medium} value={medium}>
                    {medium}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedState 
                  ? `Available for ${selectedState}: ${availableMediums.join(', ')}`
                  : 'Medium options will appear after selecting a state'
                }
              </p>
            </div>

            {/* Selection Summary */}
            {selectedState && selectedMedium && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-2">Your Selection</h4>
                <div className="text-sm text-indigo-700 space-y-1">
                  <p><strong>State:</strong> {selectedState}</p>
                  <p><strong>Medium:</strong> {selectedMedium}</p>
                  <p><strong>Language:</strong> {getStateLanguage(selectedMedium)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleNext}
              className={`btn btn-primary px-8 py-3 text-lg flex items-center justify-center mx-auto ${
                !selectedState || !selectedMedium ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
              disabled={!selectedState || !selectedMedium}
            >
              Continue to Profile Setup
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StateSelection