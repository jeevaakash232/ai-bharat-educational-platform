import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  getCurrentUser, 
  saveCurrentUser, 
  logoutUser as logoutFromStorage,
  updateUserInDatabase,
  syncUserData
} from '../utils/authStorage'

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

  useEffect(() => {
    console.log('AuthContext: Initializing...')
    // Sync user data on mount - ensures latest data from database
    const syncedUser = syncUserData()
    if (syncedUser) {
      console.log('AuthContext: User synced:', syncedUser.email)
      setUser(syncedUser)
    } else {
      console.log('AuthContext: No user found')
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    console.log('AuthContext: Login called for:', userData.email)
    // Save to both current user and ensure it's in database
    setUser(userData)
    saveCurrentUser(userData)
    
    // Ensure user is in registered users database
    updateUserInDatabase(userData.email, userData)
    console.log('AuthContext: User logged in successfully')
  }

  const logout = () => {
    console.log('AuthContext: Logout called')
    setUser(null)
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
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}