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
    // Save to both current user and ensure it's in database
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
    
    // Update user in database and get updated user
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