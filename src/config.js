// API Configuration
// This will automatically use the correct backend URL

const getApiUrl = () => {
  // Check if running in Capacitor (mobile app)
  const isCapacitor = window.Capacitor !== undefined
  
  // If accessing via ngrok domain, use same origin for API
  if (window.location.hostname.includes('ngrok')) {
    return window.location.origin
  }
  
  if (isCapacitor) {
    // Mobile app - use ngrok public URL
    return 'https://nonmonistic-eisegetical-flavia.ngrok-free.dev'
  }
  
  // If running in development on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001'
  }
  
  // For other remote access, try to use same host with different port
  return window.location.origin.replace(':5173', ':3001')
}

export const API_BASE_URL = getApiUrl()

console.log('🔗 API Base URL:', API_BASE_URL)
console.log('📱 Is Mobile App:', window.Capacitor !== undefined)
console.log('🌐 Current hostname:', window.location.hostname)
console.log('🔍 Full URL:', window.location.href)
