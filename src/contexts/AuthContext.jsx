import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  getCurrentUser, 
  saveCurrentUser, 
  logoutUser as logoutFromStorage,
  updateUserInDatabase,
  syncUserData
} from '../utils/authStorage'
import { buildStudentProfile, hasValidProfile } from '../utils/studentProfileBuilder'
import { predictStudyScore, getRiskSubjects, simulateImprovement } from '../services/studyTwinApi'
import { getStudentProfile } from '../utils/studentDataCollector'
import { trackLogin, trackLogout } from '../services/userHistoryTracker'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState(null)
  const [predictionsLoading, setPredictionsLoading] = useState(false)

  useEffect(() => {
    console.log('AuthContext: Initializing...')
    // Sync user data on mount - ensures latest data from database
    const syncedUser = syncUserData()
    if (syncedUser) {
      console.log('AuthContext: User synced:', syncedUser.email)
      // Deduplicate and normalize subjects in case of legacy data
      if (syncedUser.subjects?.length) {
        syncedUser.subjects = [...new Set(
          syncedUser.subjects
            .map(s => s === 'Language II (English)' ? 'English' : s)
            .filter(s => s !== 'Language I (Regional)') // remove placeholder, will be re-added below
        )]
        // If user has no mother tongue subject, derive and add it
        const stateLanguageMap = {
          'Tamil Nadu': 'Tamil', 'Kerala': 'Malayalam', 'Karnataka': 'Kannada',
          'Andhra Pradesh': 'Telugu', 'Telangana': 'Telugu', 'Maharashtra': 'Marathi',
          'Gujarat': 'Gujarati', 'West Bengal': 'Bengali', 'Punjab': 'Punjabi',
          'Haryana': 'Hindi', 'Rajasthan': 'Hindi', 'Madhya Pradesh': 'Hindi',
          'Uttar Pradesh': 'Hindi', 'Bihar': 'Hindi', 'Jharkhand': 'Hindi',
          'Chhattisgarh': 'Hindi', 'Uttarakhand': 'Hindi', 'Himachal Pradesh': 'Hindi',
          'Delhi': 'Hindi', 'Assam': 'Assamese', 'Odisha': 'Odia', 'Goa': 'Konkani',
          'Manipur': 'Manipuri', 'Tripura': 'Bengali', 'Meghalaya': 'English',
          'Nagaland': 'English', 'Mizoram': 'Mizo', 'Arunachal Pradesh': 'English',
          'Sikkim': 'Nepali', 'Jammu and Kashmir': 'Urdu', 'Puducherry': 'Tamil',
          'Chandigarh': 'Hindi', 'Ladakh': 'Ladakhi'
        }
        const lang = stateLanguageMap[syncedUser.selectedState] || syncedUser.stateLanguage
        if (lang && lang !== 'English') {
          const hasMotherTongue = syncedUser.subjects.includes(lang)
          if (!hasMotherTongue) {
            syncedUser.subjects = [lang, ...syncedUser.subjects]
          }
        }
        // Persist the fix back to localStorage
        saveCurrentUser(syncedUser)
        updateUserInDatabase(syncedUser.email, { subjects: syncedUser.subjects })
      }
      setUser(syncedUser)
      
      // Build profile and fetch predictions for students
      if (syncedUser.userType === 'student') {
        initializeStudentPredictions(syncedUser)
      }
    } else {
      console.log('AuthContext: No user found')
    }
    setLoading(false)
  }, [])

  /**
   * Initializes student profile and fetches AI predictions
   */
  const initializeStudentPredictions = async (userData) => {
    try {
      console.log('🤖 Initializing student predictions...')
      setPredictionsLoading(true)

      // Build student profile from user data
      const profile = buildStudentProfile(userData)
      
      if (!profile || !hasValidProfile()) {
        console.log('⚠️ Invalid profile, skipping predictions')
        setPredictionsLoading(false)
        return
      }

      // Fetch predictions from AI
      console.log('📡 Fetching AI predictions...')
      const studentProfile = getStudentProfile()
      
      const [predictionResult, riskResult] = await Promise.all([
        predictStudyScore(studentProfile).catch(err => {
          console.error('Prediction error:', err)
          return null
        }),
        getRiskSubjects(studentProfile).catch(err => {
          console.error('Risk analysis error:', err)
          return null
        })
      ])

      // Create improvement scenario
      let simulationResult = null
      if (Object.keys(studentProfile.study_time_hours).length > 0) {
        const improvementPlan = {
          increased_study_time: {},
          focus_on_topics: []
        }

        Object.keys(studentProfile.study_time_hours).forEach(subject => {
          improvementPlan.increased_study_time[subject] = 
            studentProfile.study_time_hours[subject] * 1.5
        })

        Object.values(studentProfile.weak_topics).forEach(topics => {
          improvementPlan.focus_on_topics.push(...topics)
        })

        simulationResult = await simulateImprovement(studentProfile, improvementPlan).catch(err => {
          console.error('Simulation error:', err)
          return null
        })
      }

      // Store predictions
      const predictionsData = {
        prediction: predictionResult?.prediction || null,
        riskSubjects: riskResult?.risk_subjects || [],
        simulation: simulationResult?.simulation || null,
        timestamp: new Date().toISOString()
      }

      setPredictions(predictionsData)
      console.log('✅ Predictions loaded successfully')

    } catch (error) {
      console.error('❌ Error initializing predictions:', error)
    } finally {
      setPredictionsLoading(false)
    }
  }

  const login = async (userData) => {
    console.log('AuthContext: Login called for:', userData.email)
    // Deduplicate and normalize subjects on login
    if (userData.subjects?.length) {
      userData = { ...userData, subjects: [...new Set(
        userData.subjects
          .map(s => s === 'Language II (English)' ? 'English' : s)
          .filter(s => s !== 'Language I (Regional)')
      )] }
    }
    setUser(userData)
    saveCurrentUser(userData)
    
    // Ensure user is in registered users database
    updateUserInDatabase(userData.email, userData)
    console.log('AuthContext: User logged in successfully')

    // Track login activity
    trackLogin(userData.email, userData.email).catch(err => 
      console.error('Failed to track login:', err)
    )

    // Build profile and fetch predictions for students
    if (userData.userType === 'student') {
      await initializeStudentPredictions(userData)
    }
  }

  const logout = () => {
    console.log('AuthContext: Logout called')
    
    // Track logout activity before clearing user
    if (user?.email) {
      trackLogout(user.email, user.email).catch(err => 
        console.error('Failed to track logout:', err)
      )
    }
    
    setUser(null)
    setPredictions(null)
    logoutFromStorage()
    console.log('AuthContext: User logged out')
  }

  const updateProfile = (profileData) => {
    if (!user) return
    // Deduplicate subjects if present
    if (profileData.subjects?.length) {
      profileData = { ...profileData, subjects: [...new Set(profileData.subjects)] }
    }
    const updatedUser = updateUserInDatabase(user.email, profileData)
    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  const value = {
    user,
    login,
    logout,
    updateProfile,
    loading,
    predictions,
    predictionsLoading,
    refreshPredictions: () => user && initializeStudentPredictions(user)
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}