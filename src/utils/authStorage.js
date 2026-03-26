/**
 * Centralized authentication storage utilities
 * Passwords are hashed using a simple hash before storage.
 * NOTE: For production, use a proper backend with bcrypt.
 */

const STORAGE_KEYS = {
  REGISTERED_USERS: 'registeredUsers',
  CURRENT_USER: 'edulearn_user',
}

/** Simple deterministic hash (not cryptographic — use backend bcrypt in production) */
const hashPassword = (password) => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `hashed_${Math.abs(hash).toString(36)}_${password.length}`
}

export const getRegisteredUsers = () => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)
    return users ? JSON.parse(users) : []
  } catch { return [] }
}

export const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users))
    return true
  } catch { return false }
}

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return user ? JSON.parse(user) : null
  } catch { return null }
}

export const saveCurrentUser = (user) => {
  try {
    // Never persist the raw password in current user session
    const { password, ...safeUser } = user
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser))
    return true
  } catch { return false }
}

export const findUserByEmail = (email) => {
  const users = getRegisteredUsers()
  return users.find(u => u.email === email) || null
}

export const updateUserInDatabase = (email, updates) => {
  const users = getRegisteredUsers()
  const idx = users.findIndex(u => u.email === email)
  if (idx === -1) return null

  // Don't allow overwriting password hash via updates unless explicitly re-hashing
  const { password, ...safeUpdates } = updates
  users[idx] = { ...users[idx], ...safeUpdates }
  saveRegisteredUsers(users)

  const currentUser = getCurrentUser()
  if (currentUser && currentUser.email === email) {
    const updatedUser = { ...currentUser, ...safeUpdates }
    saveCurrentUser(updatedUser)
    return updatedUser
  }
  return users[idx]
}

export const registerUser = (userData) => {
  const users = getRegisteredUsers()
  const existing = users.find(u => u.email === userData.email)
  if (existing) return { success: false, message: 'User already exists' }

  const newUser = {
    id: Date.now(),
    registeredAt: new Date().toISOString(),
    ...userData,
    // Hash password before storing; Google users already use a uid-based token
    password: userData.provider === 'google'
      ? userData.password
      : hashPassword(userData.password),
  }

  users.push(newUser)
  saveRegisteredUsers(users)

  const { password, ...safeUser } = newUser
  return { success: true, user: safeUser }
}

export const authenticateUser = (email, password, userType) => {
  const users = getRegisteredUsers()
  const hashedInput = hashPassword(password)

  const user = users.find(u =>
    u.email === email &&
    u.password === hashedInput &&
    u.userType === userType
  )

  if (user) {
    const { password: _pw, ...safeUser } = user
    saveCurrentUser(safeUser)
    return { success: true, user: safeUser }
  }
  return { success: false, message: 'Invalid credentials' }
}

export const logoutUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    return true
  } catch { return false }
}

export const syncUserData = () => {
  const currentUser = getCurrentUser()
  if (!currentUser) return null

  const latestUserData = findUserByEmail(currentUser.email)
  if (latestUserData) {
    const stateLanguageMap = {
      'Tamil Nadu': 'Tamil', 'Kerala': 'Malayalam', 'Karnataka': 'Kannada',
      'Andhra Pradesh': 'Telugu', 'Telangana': 'Telugu', 'Maharashtra': 'Marathi',
      'West Bengal': 'Bengali', 'Gujarat': 'Gujarati', 'Punjab': 'Punjabi',
      'Odisha': 'Odia', 'Assam': 'Assamese', 'Bihar': 'Hindi',
      'Uttar Pradesh': 'Hindi', 'Madhya Pradesh': 'Hindi', 'Rajasthan': 'Hindi',
      'Haryana': 'Hindi', 'Himachal Pradesh': 'Hindi', 'Chhattisgarh': 'Hindi',
      'Jharkhand': 'Hindi', 'Uttarakhand': 'Hindi', 'Goa': 'Konkani',
      'Manipur': 'Manipuri', 'Meghalaya': 'English', 'Mizoram': 'Mizo',
      'Nagaland': 'English', 'Tripura': 'Bengali', 'Sikkim': 'Nepali',
    }
    if (!latestUserData.stateLanguage && latestUserData.selectedState) {
      latestUserData.stateLanguage = stateLanguageMap[latestUserData.selectedState] || 'Tamil'
      updateUserInDatabase(latestUserData.email, { stateLanguage: latestUserData.stateLanguage })
    }
    const { password, ...safeUser } = latestUserData
    saveCurrentUser(safeUser)
    return safeUser
  }
  return currentUser
}

export const clearAllAuthData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    return true
  } catch { return false }
}

export const exportAuthData = () => ({
  users: getRegisteredUsers().map(({ password, ...u }) => u),
  currentUser: getCurrentUser(),
  exportedAt: new Date().toISOString(),
})

export const importAuthData = (data) => {
  try {
    if (data.users) saveRegisteredUsers(data.users)
    if (data.currentUser) saveCurrentUser(data.currentUser)
    return true
  } catch { return false }
}
