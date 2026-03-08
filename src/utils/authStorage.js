/**
 * Centralized authentication storage utilities
 * Ensures data consistency across mobile and PC
 */

const STORAGE_KEYS = {
  REGISTERED_USERS: 'registeredUsers',
  CURRENT_USER: 'edulearn_user',
  APP_VERSION: 'app_version'
}

/**
 * Get all registered users
 */
export const getRegisteredUsers = () => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error('Error reading registered users:', error)
    return []
  }
}

/**
 * Save registered users
 */
export const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users))
    return true
  } catch (error) {
    console.error('Error saving registered users:', error)
    return false
  }
}

/**
 * Get current logged-in user
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error reading current user:', error)
    return null
  }
}

/**
 * Save current user
 */
export const saveCurrentUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    return true
  } catch (error) {
    console.error('Error saving current user:', error)
    return false
  }
}

/**
 * Find user by email
 */
export const findUserByEmail = (email) => {
  const users = getRegisteredUsers()
  return users.find(u => u.email === email)
}

/**
 * Update user in registered users array
 */
export const updateUserInDatabase = (email, updates) => {
  const users = getRegisteredUsers()
  const userIndex = users.findIndex(u => u.email === email)
  
  if (userIndex !== -1) {
    // Merge updates with existing user data
    users[userIndex] = { ...users[userIndex], ...updates }
    saveRegisteredUsers(users)
    
    // Also update current user if it's the same user
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.email === email) {
      const updatedUser = { ...currentUser, ...updates }
      saveCurrentUser(updatedUser)
      return updatedUser
    }
    
    return users[userIndex]
  }
  
  return null
}

/**
 * Register new user
 */
export const registerUser = (userData) => {
  const users = getRegisteredUsers()
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === userData.email)
  if (existingUser) {
    return { success: false, message: 'User already exists' }
  }
  
  // Add new user
  const newUser = {
    id: Date.now(),
    registeredAt: new Date().toISOString(),
    ...userData
  }
  
  users.push(newUser)
  saveRegisteredUsers(users)
  
  return { success: true, user: newUser }
}

/**
 * Authenticate user (login)
 */
export const authenticateUser = (email, password, userType) => {
  const users = getRegisteredUsers()
  
  const user = users.find(u => 
    u.email === email && 
    u.password === password &&
    u.userType === userType
  )
  
  if (user) {
    saveCurrentUser(user)
    return { success: true, user }
  }
  
  return { success: false, message: 'Invalid credentials' }
}

/**
 * Logout user
 */
export const logoutUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    return true
  } catch (error) {
    console.error('Error logging out:', error)
    return false
  }
}

/**
 * Sync user data - ensures current user has latest data from database
 */
export const syncUserData = () => {
  const currentUser = getCurrentUser()
  if (!currentUser) return null
  
  const latestUserData = findUserByEmail(currentUser.email)
  if (latestUserData) {
    // Derive stateLanguage from selectedState if not set (for backward compatibility)
    if (!latestUserData.stateLanguage && latestUserData.selectedState) {
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
      latestUserData.stateLanguage = stateLanguageMap[latestUserData.selectedState] || 'Tamil'
      // Update in database
      updateUserInDatabase(latestUserData.email, { stateLanguage: latestUserData.stateLanguage })
    }
    
    saveCurrentUser(latestUserData)
    return latestUserData
  }
  
  // Also check current user for stateLanguage
  if (!currentUser.stateLanguage && currentUser.selectedState) {
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
    currentUser.stateLanguage = stateLanguageMap[currentUser.selectedState] || 'Tamil'
    saveCurrentUser(currentUser)
    updateUserInDatabase(currentUser.email, { stateLanguage: currentUser.stateLanguage })
  }
  
  return currentUser
}

/**
 * Clear all auth data (for testing/debugging)
 */
export const clearAllAuthData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    return true
  } catch (error) {
    console.error('Error clearing auth data:', error)
    return false
  }
}

/**
 * Export/Import data for cross-device sync
 */
export const exportAuthData = () => {
  return {
    users: getRegisteredUsers(),
    currentUser: getCurrentUser(),
    exportedAt: new Date().toISOString()
  }
}

export const importAuthData = (data) => {
  try {
    if (data.users) {
      saveRegisteredUsers(data.users)
    }
    if (data.currentUser) {
      saveCurrentUser(data.currentUser)
    }
    return true
  } catch (error) {
    console.error('Error importing auth data:', error)
    return false
  }
}
